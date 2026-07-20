const db = require('../db')

module.exports = async function ipWhitelist(ctx, next) {
  const clientIp = ctx.ip || ctx.request.ip

  const allowed = await db('admin_allowed_ips').where({ ipAddress: clientIp }).first()
  if (!allowed) {
    ctx.status = 403
    ctx.body = { code: 403, message: '접근이 허용되지 않은 IP입니다.' }
    return 
  }

  await next()
}
