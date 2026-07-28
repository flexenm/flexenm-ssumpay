const Router = require('koa-router')
const noticeService = require('../../services/notice')

const router = new Router()

router.get('/', async ctx => {
  const { page = 1, limit = 10 } = ctx.query
  const { items, total } = await noticeService.listActive({ page, limit })
  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:id', async ctx => {
  const notice = await noticeService.getActiveByIdAndBumpViewCount(ctx.params.id)
  ctx.body = { code: 200, data: notice }
})

module.exports = router
