const Router = require('koa-router')
const OrdersRepo = require('../repositories/Orders')
const UserError = require('../utils/UserError')

// 헥토 결제창이 결제 종료 후 브라우저를 돌려보내는 복귀 주소(nextUrl/cancUrl).
// 헥토는 결과 전문을 POST 로 보내는데 SPA(정적 서버)는 POST 페이지 요청을 못 받으므로,
// 서버가 받아 302(브라우저가 GET 으로 전환)로 프론트 화면에 넘긴다.
// 결제 확정은 노티(/webhooks/pg/payment)가 담당하므로 여기서는 전문을 검증·저장하지 않는다.
const router = new Router({ prefix: '/payments' })

function webUrl() {
  const url = (process.env.WEB_URL || '').replace(/\/$/, '')
  if (!url) throw new UserError('서비스 설정이 없습니다 (WEB_URL).', 503)
  return url
}

// 주문번호는 영숫자만 허용 — 리다이렉트 경로 조작을 막는다
const safeOrderNo = (v) => (typeof v === 'string' && /^[A-Za-z0-9]+$/.test(v) ? v : null)

router.post('/return', async (ctx) => {
  const orderNo = safeOrderNo(ctx.request.body?.mchtTrdNo)
  ctx.redirect(orderNo ? `${webUrl()}/order/complete/${orderNo}` : `${webUrl()}/`)
})

// 결제창에서 사용자가 취소한 경우 — 주문했던 상품의 주문 페이지로 되돌린다
router.post('/cancel', async (ctx) => {
  const orderNo = safeOrderNo(ctx.request.body?.mchtTrdNo)
  const order = orderNo ? await OrdersRepo.findByOrderNo(orderNo) : null
  ctx.redirect(order ? `${webUrl()}/order/${order.productId}` : `${webUrl()}/`)
})

module.exports = router
