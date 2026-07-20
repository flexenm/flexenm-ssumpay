const jwt = require('jsonwebtoken')

module.exports = async function userAuth(ctx, next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    ctx.status = 401
    ctx.body = { code: 401, message: '인증이 필요합니다.' }
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    ctx.state.member = decoded
    await next()
  } catch (e) {
    ctx.status = 401
    ctx.body = { code: 401, message: '유효하지 않은 토큰입니다.' }
  }
}
