const db = require('../db')

module.exports = async function ipWhitelist(ctx, next) {
  const clientIp = ctx.ip || ctx.request.ip

  let allowed
  try{
    allowed = await db('admin_allowed_ips').where({ ipAddress: clientIp }).first()
  } catch(e) {
    ctx.status = 500
    ctx.body = { code: 500, message: '서버 오류가 발생했습니다.' }
    return
  }
  if (!allowed) {
    ctx.status = 403
    ctx.body = { code: 403, message: '접근이 허용되지 않은 IP입니다.' }
    return 
  }

  await next()
}
