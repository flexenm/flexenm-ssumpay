const Router = require('koa-router')
const noticeService = require('../../services/notice')
const { wrap } = require('../shared/handler-wrap')

const router = new Router()

router.get(
  '/',
  wrap(async ({ page = 1, limit = 20, keyword, isPinned }) => {
    const { items, total } = await noticeService.listForAdmin({ page, limit, keyword, isPinned })
    return { items, total, page: Number(page), limit: Number(limit) }
  })
)

router.get(
  '/:id',
  wrap(async ({ id }) => {
    return await noticeService.getByIdForAdmin(id)
  })
)

router.post(
  '/',
  wrap(async ({ title, content, isPinned }) => {
    return await noticeService.createNotice({ title, content, isPinned })
  })
)

router.put(
  '/:id',
  wrap(async ({ id, title, content, isPinned, isActive }) => {
    return await noticeService.updateNotice(id, { title, content, isPinned, isActive })
  })
)

router.delete(
  '/:id',
  wrap(async ({ id }) => {
    await noticeService.deleteNotice(id)
    return { message: '공지사항이 삭제되었습니다.' }
  })
)

module.exports = router
