const jwt = require('jsonwebtoken')
const Admin = require('../entities/Admin')

module.exports = async function adminAuth(ctx, next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    ctx.status = 401
    ctx.body = { code: 401, message: '인증이 필요합니다.' }
    return
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET)
  } catch (e) {
    ctx.status = 401
    ctx.body = { code: 401, message: '유효하지 않은 토큰입니다.' }
    return
  }

  let admin
  try{
    admin = await Admin.query().findById(decoded.id).select('id', 'isActive')
  }catch(e){
    ctx.status = 500
    ctx.body = { code: 500, message: '서버 오류가 발생했습니다.' }
    return
  }

  if (!admin || !admin.isActive) {
    ctx.status = 401
    ctx.body = { code: 401, message: '인증이 필요합니다.' }
    return
  }

  ctx.state.admin = admin
  await next()
}
