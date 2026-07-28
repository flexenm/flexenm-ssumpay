const Router = require('koa-router')
const noticeService = require('../../services/notice')

const router = new Router()

router.get('/', async ctx => {
  const { page = 1, limit = 20, keyword, isPinned } = ctx.query
  const { items, total } = await noticeService.listForAdmin({ page, limit, keyword, isPinned })
  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:id', async ctx => {
  const notice = await noticeService.getByIdForAdmin(ctx.params.id)
  ctx.body = { code: 200, data: notice }
})

router.post('/', async ctx => {
  const notice = await noticeService.createNotice(ctx.request.body)
  ctx.status = 201
  ctx.body = { code: 201, data: notice }
})

router.put('/:id', async ctx => {
  const updated = await noticeService.updateNotice(ctx.params.id, ctx.request.body)
  ctx.body = { code: 200, data: updated }
})

router.delete('/:id', async ctx => {
  await noticeService.deleteNotice(ctx.params.id)
  ctx.body = { code: 200, message: '공지사항이 삭제되었습니다.' }
})

module.exports = router
