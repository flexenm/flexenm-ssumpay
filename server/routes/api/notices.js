const Router = require('koa-router')
const noticeService = require('../../services/notice')
const { wrap } = require('../shared/handler-wrap')

const router = new Router()

router.get(
  '/',
  wrap(async ({ page = 1, limit = 10 }) => {
    const { items, total } = await noticeService.listActive({ page, limit })
    return { items, total, page: Number(page), limit: Number(limit) }
  })
)

router.get(
  '/:id',
  wrap(async ({ id }) => {
    return await noticeService.getActiveByIdAndBumpViewCount(id)
  })
)

module.exports = router
