const crypto = require('crypto')
const redis = require('../redis')

const REFRESH_TTL_SECONDS = { member: 60 * 60 * 24 * 30, admin: 60 * 60 * 24 * 7 }

class RefreshTokens {
  async issue({ type, id }) {
    const token = crypto.randomBytes(32).toString('hex')
    const ttl = REFRESH_TTL_SECONDS[type]
    await redis.set(`refresh:${token}`, JSON.stringify({ type, id }), 'EX', ttl)
    await redis.sadd(`refresh:index:${type}:${id}`, token)
    return token
  }

  async find(token) {
    const raw = await redis.get(`refresh:${token}`)
    return raw ? JSON.parse(raw) : null
  }

  async rotate(oldToken, { type, id }) {
    await this.revoke(oldToken)
    return this.issue({ type, id })
  }

  async revoke(token) {
    const data = await this.find(token)
    if (!data) return
    await redis.del(`refresh:${token}`)
    await redis.srem(`refresh:index:${data.type}:${data.id}`, token)
  }

  async revokeAllFor({ type, id }) {
    const tokens = await redis.smembers(`refresh:index:${type}:${id}`)
    if (tokens.length) await redis.del(...tokens.map((t) => `refresh:${t}`))
    await redis.del(`refresh:index:${type}:${id}`)
  }
}

module.exports = new RefreshTokens()
