const PG_API_URL = process.env.PG_API_URL
const PG_API_KEY = process.env.PG_API_KEY
const PG_WEBHOOK_SECRET = process.env.PG_WEBHOOK_SECRET

function assertConfigured() {
  if (!PG_API_URL || !PG_API_KEY) {
    throw Object.assign(new Error('PG 연동 설정이 없습니다.'), { status: 503 })
  }
}

// 가상계좌 발급 요청. PG 확정 후 실제 엔드포인트/응답 필드에 맞춰 구현.
async function issueVirtualAccount({ orderNo, amount }) {
  assertConfigured()
  throw Object.assign(new Error('PG 연동이 아직 구현되지 않았습니다 (issueVirtualAccount).'), { status: 501 })
}

// 카드결제 서버 승인 호출. 클라이언트가 보낸 paymentKey를 그대로 믿지 않고
// PG 서버에 다시 확인해서 실제 승인 금액/상태를 받아온다.
async function approvePayment({ paymentKey, orderNo, amount }) {
  assertConfigured()
  throw Object.assign(new Error('PG 연동이 아직 구현되지 않았습니다 (approvePayment).'), { status: 501 })
}

// PG 웹훅 서명 검증. PG마다 방식이 달라(HMAC 헤더, IP 화이트리스트 등) PG 확정 후 구현.
function verifyWebhookSignature(ctx) {
  if (!PG_WEBHOOK_SECRET) return false
  throw Object.assign(new Error('PG 연동이 아직 구현되지 않았습니다 (verifyWebhookSignature).'), { status: 501 })
}

module.exports = {
  issueVirtualAccount,
  approvePayment,
  verifyWebhookSignature
}