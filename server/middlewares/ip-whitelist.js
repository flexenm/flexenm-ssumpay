const db = require('../db')
const UserError = require('../utils/UserError')

module.exports = async function ipWhitelist(ctx, next) {
  const clientIp = ctx.ip || ctx.request.ip

  const allowed = await db('admin_allowed_ips').where({ ipAddress: clientIp }).first()

  if (!allowed) {
    throw new UserError('접근이 허용되지 않은 IP입니다.', 403)
  }

  await next()
}