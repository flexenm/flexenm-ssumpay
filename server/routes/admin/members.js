const Router = require('koa-router')
const memberService = require('../../services/member')

const router = new Router()

router.get('/', async ctx => {
  const { page = 1, limit = 20, keyword, status } = ctx.query
  const { items, total } = await memberService.listForAdmin({ page, limit, keyword, status })
  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:id', async ctx => {
  const member = await memberService.getByIdForAdmin(ctx.params.id)
  ctx.body = { code: 200, data: member }
})

router.patch('/:id/status', async ctx => {
  const message = await memberService.updateStatus(ctx.params.id, ctx.request.body.status)
  ctx.body = { code: 200, message }
})

module.exports = router
