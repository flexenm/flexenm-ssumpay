const crypto = require('crypto')
const redis = require('../redis')
const { hashToken } = require('../utils/hashToken')

const REFRESH_TTL_SECONDS = { member: 60 * 60 * 24 * 30, admin: 60 * 60 * 24 * 7 }

class RefreshTokens {
  async issue({ type, id }) {
    const token = crypto.randomBytes(32).toString('hex')
    const hashed = hashToken(token)
    const ttl = REFRESH_TTL_SECONDS[type]
    await redis.set(`refresh:${hashed}`, JSON.stringify({ type, id }), 'EX', ttl)
    await redis.sadd(`refresh:index:${type}:${id}`, hashed)
    return token
  }

  async find(token) {
    const raw = await redis.get(`refresh:${hashToken(token)}`)
    return raw ? JSON.parse(raw) : null
  }

  async rotate(oldToken, { type, id }) {
    await this.revoke(oldToken)
    return this.issue({ type, id })
  }

  async revoke(token) {
    const hashed = hashToken(token)
    const data = await this.find(token)
    if (!data) return
    await redis.del(`refresh:${hashed}`)
    await redis.srem(`refresh:index:${data.type}:${data.id}`, hashed)
  }

  async revokeAllFor({ type, id }) {
    const hashes = await redis.smembers(`refresh:index:${type}:${id}`)
    if (hashes.length) await redis.del(...hashes.map((h) => `refresh:${h}`))
    await redis.del(`refresh:index:${type}:${id}`)
  }
}

module.exports = new RefreshTokens()
