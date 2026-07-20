const Router = require('koa-router')
const Inquiry = require('../../entities/Inquiry')
const userAuth = require('../../middlewares/user-auth')

const router = new Router()

router.use(userAuth)

router.get('/', async ctx => {
  const { page = 1, limit = 10 } = ctx.query
  const offset = (page - 1) * limit
  const memberId = ctx.state.member.id

  const [items, total] = await Promise.all([
    Inquiry.query()
      .where({ memberId })
      .select('id', 'type', 'title', 'status', 'createdAt', 'answeredAt')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset),
    Inquiry.query().where({ memberId }).resultSize()
  ])

  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:id', async ctx => {
  const inquiry = await Inquiry.query()
    .findById(ctx.params.id)
    .where({ memberId: ctx.state.member.id })

  if (!inquiry) {
    ctx.status = 404
    ctx.body = { code: 404, message: '문의를 찾을 수 없습니다.' }
    return
  }
  ctx.body = { code: 200, data: inquiry }
})

router.post('/', async ctx => {
  const { type, title, content } = ctx.request.body
  if (type === undefined || type === null || type === '' || !title || !content) {
    ctx.status = 400
    ctx.body = { code: 400, message: '문의 유형, 제목, 내용을 입력해주세요.' }
    return
  }

  const inquiry = await Inquiry.query().insertAndFetch({
    memberId: ctx.state.member.id, type, title, content, status: 0
  })

  ctx.status = 201
  ctx.body = { code: 201, data: inquiry }
})

router.put('/:id', async ctx => {
  const inquiry = await Inquiry.query()
    .findById(ctx.params.id)
    .where({ memberId: ctx.state.member.id })

  if (!inquiry) {
    ctx.status = 404
    ctx.body = { code: 404, message: '문의를 찾을 수 없습니다.' }
    return
  }
  if (inquiry.status !== 0) {
    ctx.status = 403
    ctx.body = { code: 403, message: '답변이 완료된 문의는 수정할 수 없습니다.' }
    return
  }

  const { title, content } = ctx.request.body
  const updated = await Inquiry.query().patchAndFetchById(inquiry.id, { title, content })
  ctx.body = { code: 200, data: updated }
})

router.delete('/:id', async ctx => {
  const inquiry = await Inquiry.query()
    .findById(ctx.params.id)
    .where({ memberId: ctx.state.member.id })

  if (!inquiry) {
    ctx.status = 404
    ctx.body = { code: 404, message: '문의를 찾을 수 없습니다.' }
    return
  }
  if (inquiry.status !== 0) {
    ctx.status = 403
    ctx.body = { code: 403, message: '답변이 완료된 문의는 삭제할 수 없습니다.' }
    return
  }

  await Inquiry.query().deleteById(inquiry.id)
  ctx.body = { code: 200, message: '문의가 삭제되었습니다.' }
})

module.exports = router
