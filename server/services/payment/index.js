const hecto = require('../hecto/client')
const { aesEncrypt, aesDecrypt, makeRequestHash, verifyNotiHash } = require('../hecto/crypto')

// ── PG 중립 인터페이스 (헥토파이낸셜 구현) ──────────────────────────────
// 결제 확정의 최종 진실은 노티(웹훅)다. confirm(approvePayment)은 노티를 받을 수 없는
// 환경(공개 도메인 없음)을 위한 보조 확정 경로로, 암호화 금액 복호화 대조로 검증한다.

// 가상계좌 발급. createOrder가 기대하는 { accountNo, bankName, expiredAt } 형태로 반환.
async function issueVirtualAccount({ orderNo, amount, productName, payerName }) {
  return hecto.issueVirtualAccount({ mchtTrdNo: orderNo, amount, productName, custName: payerName })
}

// 카드 결제창 파라미터 생성. 프론트(또는 테스트 페이지)가 SETTLE_PG.pay에 그대로 넘긴다.
// 암호화 키·해시 키는 서버에만 있으므로 이 파라미터 생성은 반드시 서버에서 한다.
function preparePayment({ order, custName }) {
  hecto.assertConfigured()
  const c = hecto.cfg()
  const { trdDt, trdTm } = hecto.nowDtTm()
  const method = 'card'
  const params = {
    env: c.pgUrl,
    mchtId: c.mchtId,
    method,
    trdDt,
    trdTm,
    mchtTrdNo: order.orderNo,
    mchtName: c.mchtName,
    mchtEName: c.mchtEName,
    pmtPrdtNm: order.productName,
    trdAmt: aesEncrypt(order.price, c.aesKey),
    mchtCustNm: custName ? aesEncrypt(custName, c.aesKey) : '',
    notiUrl: hecto.notiUrl(),
    nextUrl: '', // 프론트 연동 시 결제 완료 화면 URL을 넣는다 (테스트 페이지는 자체 값 설정)
    cancUrl: '',
    pktHash: makeRequestHash(
      { mchtId: c.mchtId, method, mchtTrdNo: order.orderNo, trdDt, trdTm, trdAmt: String(order.price) },
      c.hashKey
    ),
    ui: { type: 'popup', width: '430', height: '660' }
  }
  return {
    payUrl: `${c.pgUrl}/card/main.do`,
    sdkUrl: `${c.pgUrl}/resources/js/v1/SettlePG.js`,
    params
  }
}

// 카드 확정(보조 경로). paymentKey = 헥토 거래번호(trdNo), amount = 결제창 응답의 암호화된 trdAmt.
// 라이선스키는 서버에만 있으므로 유효한 암호문은 헥토만 만들 수 있다.
// 한계: 같은 금액의 다른 거래 암호문을 재사용한 위조는 이론상 가능 — 최종 진실은 노티이며,
// 거래조회 API 확보 시 이 함수를 조회 기반으로 교체한다.
async function approvePayment({ paymentKey, orderNo, amount }) {
  hecto.assertConfigured()
  const c = hecto.cfg()
  if (!paymentKey || !amount) {
    throw Object.assign(new Error('결제 확인 정보가 없습니다.'), { status: 400 })
  }
  let decrypted
  try {
    decrypted = aesDecrypt(amount, c.aesKey)
  } catch (e) {
    console.error(`[approvePayment] trdAmt 복호화 실패 orderNo=${orderNo}:`, e.message)
    throw Object.assign(new Error('결제 금액 검증에 실패했습니다.'), { status: 400 })
  }
  return { amount: Number(decrypted), transactionId: paymentKey }
}

// 노티 위변조 검증. 헥토 노티는 form-urlencoded 평문 + pktHash(SHA256)다.
function verifyWebhookSignature(ctx) {
  const c = hecto.cfg()
  if (!c.hashKey) return false
  const { outStatCd, trdDtm, mchtId, mchtTrdNo, trdAmt, pktHash } = ctx.request.body || {}
  if (mchtId !== c.mchtId) return false
  return verifyNotiHash({ outStatCd, trdDtm, mchtId, mchtTrdNo, trdAmt, pktHash }, c.hashKey)
}

// 카드 승인취소. 취소 거래번호는 'CNCL' 접두어 — 웹훅이 이 접두어로 취소 노티를 식별해 무시한다
// (flextv-webtoon과 동일한 컨벤션).
async function cancelPayment({ orderNo, pgTrxNo, amount, reason }) {
  if (!pgTrxNo) {
    throw Object.assign(new Error('PG 거래번호가 없어 취소할 수 없습니다.'), { status: 400 })
  }
  return hecto.cancelCard({ orgTrdNo: pgTrxNo, mchtTrdNo: `CNCL${orderNo}${Date.now() % 100000}`, amount, reason })
}

module.exports = {
  issueVirtualAccount,
  preparePayment,
  approvePayment,
  verifyWebhookSignature,
  cancelPayment
}
