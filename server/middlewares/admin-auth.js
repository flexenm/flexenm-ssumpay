const jwt = require('jsonwebtoken')
const Admin = require('../entities/Admin')
const UserError = require('../utils/UserError')

module.exports = async function adminAuth(ctx, next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    throw new UserError('인증이 필요합니다.', 401)
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET)
  } catch (e) {
    throw new UserError('유효하지 않은 토큰입니다.', 401)
  }

  const admin = await Admin.query().findById(decoded.id).select('id', 'isActive')

  if (!admin || !admin.isActive) {
    throw new UserError('인증이 필요합니다.', 401)
  }

  ctx.state.admin = admin
  await next()
}