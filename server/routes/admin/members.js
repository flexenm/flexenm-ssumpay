const Router = require('koa-router')
const Member = require('../../entities/Member')
const UserError = require('../../utils/UserError')
const { MEMBER_STATUS } = require('../../const')

const router = new Router()

router.get('/', async ctx => {
  const { page = 1, limit = 20, keyword, status } = ctx.query
  const offset = (page - 1) * limit

  let query = Member.query()
    .select('id', 'username', 'name', 'email', 'phone', 'flexUsername', 'status', 'createdAt')
    .orderBy('createdAt', 'desc')

  if (keyword) {
    query = query.where(q => {
      q.where('username', 'like', `%${keyword}%`)
        .orWhere('name', 'like', `%${keyword}%`)
        .orWhere('email', 'like', `%${keyword}%`)
    })
  }
  if (status) query = query.where({ status })

  const [items, total] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    query.clone().resultSize()
  ])

  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:id', async ctx => {
  const member = await Member.query()
    .findById(ctx.params.id)
    .select('id', 'username', 'name', 'email', 'phone', 'flexUsername', 'status', 'createdAt')

  if (!member) {
    throw new UserError('회원을 찾을 수 없습니다.', 404)
  }
  ctx.body = { code: 200, data: member }
})

router.patch('/:id/status', async ctx => {
  const { status } = ctx.request.body
  if (status === undefined || ![MEMBER_STATUS.NORMAL, MEMBER_STATUS.BLOCKED].includes(Number(status))) {
    throw new UserError('올바른 상태값을 입력해주세요.', 400)
  }
  await Member.query().patchAndFetchById(ctx.params.id, { status })
  ctx.body = { code: 200, message: Number(status) === MEMBER_STATUS.BLOCKED ? '회원이 차단되었습니다.' : '차단이 해제되었습니다.' }
})

module.exports = router