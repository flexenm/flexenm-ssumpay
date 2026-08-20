const hecto = require('../hecto/client')
const { aesEncrypt, makeRequestHash, verifyNotiHash } = require('../hecto/crypto')

// ── PG 중립 인터페이스 (헥토파이낸셜 구현) ──────────────────────────────
// 결제 확정은 노티(웹훅)로만 이뤄진다 — 클라이언트가 전달하는 결제 결과는 신뢰하지 않는다.

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
    nextUrl: hecto.returnUrl('return'),
    cancUrl: hecto.returnUrl('cancel'),
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
  verifyWebhookSignature,
  cancelPayment
}
