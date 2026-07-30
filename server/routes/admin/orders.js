const Router = require('koa-router')
const orderService = require('../../services/order')

const router = new Router()

router.get('/', async ctx => {
  const { page = 1, limit = 20, paymentStatus, chargeStatus, keyword, startDate, endDate } = ctx.query
  const { items, total } = await orderService.searchForAdmin({ page, limit, paymentStatus, chargeStatus, keyword, startDate, endDate })
  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:id', async ctx => {
  const order = await orderService.getByIdForAdmin(ctx.params.id)
  ctx.body = { code: 200, data: order }
})

router.patch('/:id/payment-confirm', async ctx => {
  await orderService.confirmPaymentManually(ctx.params.id, ctx.state.admin.id, ctx.request.body)
  ctx.body = { code: 200, message: '결제가 확인 처리되었습니다.' }
})

router.patch('/:id/charge-status', async ctx => {
  await orderService.updateChargeStatus(ctx.params.id, ctx.request.body)
  ctx.body = { code: 200, message: '충전 상태가 변경되었습니다.' }
})

router.patch('/:id/memo', async ctx => {
  await orderService.updateMemo(ctx.params.id, ctx.request.body.memo)
  ctx.body = { code: 200, message: '메모가 저장되었습니다.' }
})

module.exports = router
