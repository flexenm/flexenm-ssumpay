// 인메모리 rate limiter — window 내 max 초과 시 429 반환
const store = new Map()

function rateLimit({ windowMs = 60_000, max = 10, message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' } = {}) {
  return async (ctx, next) => {
    const key = `${ctx.ip}:${ctx.path}`
    const now = Date.now()
    const entry = store.get(key) || { count: 0, resetAt: now + windowMs }

    if (now > entry.resetAt) {
      entry.count = 0
      entry.resetAt = now + windowMs
    }

    entry.count += 1
    store.set(key, entry)

    if (entry.count > max) {
      ctx.status = 429
      ctx.body = { code: 429, message }
      return
    }

    await next()
  }
}

module.exports = rateLimit
