const axios = require('axios')
const { aesEncrypt, aesDecrypt, makeRequestHash, makeCancelHash } = require('./crypto')

const cfg = () => ({
  mchtId: process.env.HECTO_MCHT_ID,
  aesKey: process.env.HECTO_AES_KEY,
  hashKey: process.env.HECTO_HASH_KEY,
  mchtName: process.env.HECTO_MCHT_NAME || 'ssumpay',
  mchtEName: process.env.HECTO_MCHT_ENAME || 'ssumpay',
  pgUrl: process.env.HECTO_PG_URL || 'https://tbnpg.settlebank.co.kr',
  apiUrl: process.env.HECTO_API_URL || 'https://tbgw.settlebank.co.kr',
  // 웹툰 프로젝트(flextv-webtoon)와 동일한 컨벤션 — 서버 자신의 공개 URL (노티 수신용)
  serverUrl: process.env.SERVER_URL || ''
})

function assertConfigured() {
  const { mchtId, aesKey, hashKey } = cfg()
  if (!mchtId || !aesKey || !hashKey) {
    throw Object.assign(new Error('헥토 PG 연동 설정이 없습니다 (HECTO_MCHT_ID/AES_KEY/HASH_KEY).'), { status: 503 })
  }
}

function nowDtTm() {
  const d = new Date()
  const p = (n, w = 2) => String(n).padStart(w, '0')
  return {
    trdDt: `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`,
    trdTm: `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  }
}

function notiUrl() {
  const { serverUrl } = cfg()
  if (!serverUrl) {
    console.warn('[hecto] SERVER_URL 미설정 — 노티를 받을 수 없어 입금/승인 자동 확정이 동작하지 않습니다.')
    return ''
  }
  return `${serverUrl.replace(/\/$/, '')}/webhooks/pg/payment`
}

// yyyyMMddHHmmss → MySQL DATETIME 문자열
function toDatetime(dtm) {
  if (!dtm || String(dtm).length !== 14) return null
  const s = String(dtm)
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}`
}

// 가상계좌 채번 (서버-투-서버). 성공 outStatCd=0051.
// 응답의 vtlAcntNo는 AES 암호화돼 오므로 복호화해서 반환한다.
async function issueVirtualAccount({ mchtTrdNo, amount, productName, custName }) {
  assertConfigured()
  const c = cfg()
  const { trdDt, trdTm } = nowDtTm()
  const method = 'vbank'
  const params = {
    mchtId: c.mchtId,
    method,
    trdDt,
    trdTm,
    mchtTrdNo,
    mchtName: c.mchtName,
    mchtEName: c.mchtEName,
    pmtPrdtNm: productName,
    trdAmt: aesEncrypt(amount, c.aesKey),
    mchtCustNm: custName ? aesEncrypt(custName, c.aesKey) : undefined,
    notiUrl: notiUrl() || undefined,
    pktHash: makeRequestHash({ mchtId: c.mchtId, method, mchtTrdNo, trdDt, trdTm, trdAmt: String(amount) }, c.hashKey)
  }

  const form = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
  ).toString()

  const res = await axios.post(`${c.pgUrl}/vbank/main.do`, form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    timeout: 10000
  })

  // 응답이 JSON이면 그대로, 문자열이면 form 인코딩으로 파싱 (첫 실연동 시 실제 포맷 확인)
  const body = typeof res.data === 'string' ? Object.fromEntries(new URLSearchParams(res.data)) : (res.data || {})
  if (body.outStatCd !== '0051') {
    console.error('[hecto] 가상계좌 채번 실패:', body.outStatCd, body.outRsltCd, body.outRsltMsg)
    throw Object.assign(new Error('가상계좌 발급에 실패했습니다. 잠시 후 다시 시도해주세요.'), { status: 502 })
  }

  return {
    accountNo: aesDecrypt(body.vtlAcntNo, c.aesKey),
    bankName: body.fnNm,
    bankCode: body.fnCd,
    expiredAt: toDatetime(body.expireDt),
    trdNo: body.trdNo
  }
}

// 카드 승인취소. 성공 outStatCd=0021.
// 요청 구조(params/data 분리, ver/encCd 값)는 문서 예제 기준 — 테스트베드 첫 호출에서
// 에러 코드가 나오면 응답 메시지를 기준으로 조정한다.
async function cancelCard({ orgTrdNo, mchtTrdNo, amount }) {
  assertConfigured()
  const c = cfg()
  const { trdDt, trdTm } = nowDtTm()
  const payload = {
    params: {
      mchtId: c.mchtId,
      ver: '0A19',
      method: 'CA',
      bizType: 'C0',
      encCd: '23',
      mchtTrdNo, // 취소 거래용 신규 번호 (원거래와 달라야 함)
      trdDt,
      trdTm
    },
    data: {
      orgTrdNo,
      crcCd: 'KRW',
      cnclOrd: '001',
      cnclAmt: aesEncrypt(amount, c.aesKey)
    },
    // 해시는 원거래번호(orgTrdNo)가 아니라 취소용 주문번호(mchtTrdNo) 기준 — flextv-webtoon에서 검증된 규칙
    pktHash: makeCancelHash({ trdDt, trdTm, mchtId: c.mchtId, mchtTrdNo, cnclAmt: String(amount) }, c.hashKey)
  }

  const res = await axios.post(`${c.apiUrl}/spay/APICancel.do`, payload, {
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    timeout: 10000
  })

  const out = res.data?.params ?? res.data ?? {}
  if (out.outStatCd !== '0021') {
    console.error('[hecto] 카드 취소 실패:', out.outStatCd, out.outRsltCd, out.outRsltMsg)
    throw Object.assign(new Error(`결제 취소에 실패했습니다. (${out.outRsltMsg || out.outRsltCd || '알 수 없는 오류'})`), { status: 502 })
  }
  return { cancelTrdNo: out.trdNo }
}

module.exports = { cfg, assertConfigured, nowDtTm, notiUrl, toDatetime, issueVirtualAccount, cancelCard }
