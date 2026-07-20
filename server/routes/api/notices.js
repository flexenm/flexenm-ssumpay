const Router = require('koa-router')
const { raw } = require('objection')
const Notice = require('../../entities/Notice')

const router = new Router()

router.get('/', async ctx => {
  const { page = 1, limit = 10 } = ctx.query
  const offset = (page - 1) * limit

  const [items, total] = await Promise.all([
    Notice.query()
      .where({ isActive: 1 })
      .orderBy('isPinned', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset),
    Notice.query().where({ isActive: 1 }).resultSize()
  ])

  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:id', async ctx => {
  const notice = await Notice.query().findById(ctx.params.id).where({ isActive: 1 })
  if (!notice) {
    ctx.status = 404
    ctx.body = { code: 404, message: '공지사항을 찾을 수 없습니다.' }
    return
  }

  await Notice.query().patch({ viewCount: raw('viewCount + 1') }).where({ id: notice.id })
  ctx.body = { code: 200, data: notice }
})

module.exports = router