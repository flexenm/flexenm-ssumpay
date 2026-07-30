const { RateLimiterRedis, RateLimiterRes } = require('rate-limiter-flexible')
const redis = require('../redis')
const UserError = require('../utils/UserError')

function rateLimit({ windowMs = 60_000, max = 10, message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', keyBy } = {}) {
  const limiter = new RateLimiterRedis({
    storeClient: redis,
    points: max,
    duration: Math.ceil(windowMs / 1000),
    keyPrefix: 'rl',
  })

  const resolveKey = keyBy || ((ctx) => `${ctx.ip}:${ctx.path}`)

  return async (ctx, next) => {
    try {
      await limiter.consume(resolveKey(ctx))
    } catch (err) {
      // consume()은 실제 한도 초과 시 RateLimiterRes로 reject한다.
      // 그 외(Redis 장애 등)는 별개의 에러이므로 429로 위장하지 않고 그대로 위로 던진다.
      if (err instanceof RateLimiterRes) {
        throw new UserError(message, 429)
      }
      console.error('[RATE LIMITER ERROR]', err)
      throw err
    }
    await next()
  }
}

module.exports = rateLimit
