const jwt = require('jsonwebtoken')

module.exports = async function adminAuth(ctx, next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    ctx.status = 401
    ctx.body = { code: 401, message: '인증이 필요합니다.' }
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET)
    ctx.state.admin = decoded
    await next()
  } catch (e) {
    ctx.status = 401
    ctx.body = { code: 401, message: '유효하지 않은 토큰입니다.' }
  }
}
