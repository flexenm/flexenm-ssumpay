const Router = require('koa-router')
const orderService = require('../../services/order')
const PaymentGateway = require('../../services/payment')

// PG가 서버-투-서버로 호출하는 웹훅. 사용자 세션이 없으므로 userAuth 대신
// PG 서명 검증으로 신뢰 경계를 대체한다 (routes/api/index.js의 명시적 미들웨어 부착 원칙과 동일).
const router = new Router({ prefix: '/webhooks/pg' })

router.post('/payment', async (ctx) => {
  const verified = PaymentGateway.verifyWebhookSignature(ctx)
  if (!verified) {
    ctx.status = 401
    ctx.body = { code: 401, message: '서명 검증에 실패했습니다.' }
    return
  }

  const { orderNo, amount, transactionId } = ctx.request.body
  await orderService.confirmWebhookPayment({ orderNo, amount, transactionId })

  // 우리 쪽 판단(금액 불일치 등)과 무관하게 웹훅 자체는 정상 수신했음을 알려 PG의 재전송을 막는다.
  ctx.body = { code: 200 }
})

module.exports = router
