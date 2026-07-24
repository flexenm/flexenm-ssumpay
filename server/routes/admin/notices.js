const Router = require('koa-router')
const Notice = require('../../entities/Notice')

const router = new Router()

router.get('/', async ctx => {
  const { page = 1, limit = 20, keyword, isPinned } = ctx.query
  const offset = (page - 1) * limit

  let query = Notice.query().orderBy('isPinned', 'desc').orderBy('createdAt', 'desc')
  if (keyword) query = query.where('title', 'like', `%${keyword}%`)
  if (isPinned !== undefined && isPinned !== '') query = query.where({ isPinned })

  const [items, total] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    query.clone().resultSize()
  ])

  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:id', async ctx => {
  const notice = await Notice.query().findById(ctx.params.id)
  if (!notice) {
    ctx.status = 404
    ctx.body = { code: 404, message: '공지사항을 찾을 수 없습니다.' }
    return
  }
  ctx.body = { code: 200, data: notice }
})

router.post('/', async ctx => {
  const { title, content, isPinned } = ctx.request.body
  if (!title || !content) {
    ctx.status = 400
    ctx.body = { code: 400, message: '제목과 내용을 입력해주세요.' }
    return
  }

  const notice = await Notice.query().insertAndFetch({
    title, content, isPinned: isPinned ? 1 : 0, isActive: 1
  })

  ctx.status = 201
  ctx.body = { code: 201, data: notice }
})

router.put('/:id', async ctx => {
  const notice = await Notice.query().findById(ctx.params.id)
  if (!notice) {
    ctx.status = 404
    ctx.body = { code: 404, message: '공지사항을 찾을 수 없습니다.' }
    return
  }

  const { title, content, isPinned, isActive } = ctx.request.body
  const updated = await Notice.query().patchAndFetchById(ctx.params.id, {
    title, content,
    isPinned: isPinned ? 1 : 0,
    isActive: isActive !== undefined ? isActive : notice.isActive
  })

  ctx.body = { code: 200, data: updated }
})

router.delete('/:id', async ctx => {
  await Notice.query().deleteById(ctx.params.id)
  ctx.body = { code: 200, message: '공지사항이 삭제되었습니다.' }
})

module.exports = router
