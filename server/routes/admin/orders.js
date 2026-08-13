const Router = require('koa-router')
const orderService = require('../../services/order')
const { wrap } = require('../shared/handler-wrap')

const router = new Router()

router.get(
  '/',
  wrap(async ({ page = 1, limit = 20, paymentStatus, chargeStatus, keyword, startDate, endDate }) => {
    const { items, total } = await orderService.searchForAdmin({ page, limit, paymentStatus, chargeStatus, keyword, startDate, endDate })
    return { items, total, page: Number(page), limit: Number(limit) }
  })
)

router.get(
  '/:id',
  wrap(async ({ id }) => {
    return await orderService.getByIdForAdmin(id)
  })
)

router.patch(
  '/:id/charge-status',
  wrap(async ({ id, chargeStatus, memo }) => {
    await orderService.updateChargeStatus(id, { chargeStatus, memo })
    return { message: '충전 상태가 변경되었습니다.' }
  })
)

router.patch(
  '/:id/memo',
  wrap(async ({ id, memo }) => {
    await orderService.updateMemo(id, memo)
    return { message: '메모가 저장되었습니다.' }
  })
)

module.exports = router
