const { RateLimiterMemory } = require('rate-limiter-flexible')

function rateLimit({ windowMs = 60_000, max = 10, message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' } = {}) {
  const limiter = new RateLimiterMemory({
    points: max,
    duration: Math.ceil(windowMs / 1000),
    keyPrefix: 'rl',
  })

  return async (ctx, next) => {
    try {
      await limiter.consume(`${ctx.ip}:${ctx.path}`)
      await next()
    } catch {
      ctx.status = 429
      ctx.body = { code: 429, message }
    }
  }
}

module.exports = rateLimit
