const jwt = require('jsonwebtoken')
const Member = require('../entities/Member')
const { MEMBER_STATUS } = require('../const')
const UserError = require('../utils/UserError')

module.exports = async function userAuth(ctx, next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    throw new UserError('인증이 필요합니다.', 401)
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
    throw new UserError('유효하지 않은 토큰입니다.', 401)
  }

  const member = await Member.query().findById(decoded.id).select('id', 'status')

  if (!member || member.status === MEMBER_STATUS.BLOCKED) {
    throw new UserError('인증이 필요합니다.', 401)
  }

  ctx.state.member = { id: member.id, status: member.status }
  await next()
}