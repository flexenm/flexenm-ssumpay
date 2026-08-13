const Router = require('koa-router')
const memberService = require('../../services/member')
const { wrap } = require('../shared/handler-wrap')

const router = new Router()

router.get(
  '/',
  wrap(async ({ page = 1, limit = 20, keyword, status }) => {
    const { items, total } = await memberService.listForAdmin({ page, limit, keyword, status })
    return { items, total, page: Number(page), limit: Number(limit) }
  })
)

router.get(
  '/:id',
  wrap(async ({ id }) => {
    return await memberService.getByIdForAdmin(id)
  })
)

router.patch(
  '/:id/status',
  wrap(async ({ id, status }) => {
    const message = await memberService.updateStatus(id, status)
    return { message }
  })
)

module.exports = router
