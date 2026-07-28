require('dotenv').config()

if (!process.env.JWT_SECRET || !process.env.ADMIN_JWT_SECRET) {
  console.error('[ERROR] JWT_SECRET 또는 ADMIN_JWT_SECRET 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const helmet = require('koa-helmet')
const cors = require('@koa/cors')

const routes = require('./routes')

const app = new Koa()

app.proxy = true

// ② 전역 에러 핸들러
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    if (ctx.status >= 500) {
      ctx.body = { code: 500, message: '서버 오류가 발생했습니다.' }
      console.error('[ERROR]', err)
    } else {
      ctx.body = { code: ctx.status, message: err.message }
    }
  }
})

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000']

// ① CORS — 허용 오리진 명시
app.use(cors({
  origin: (ctx) => {
    const origin = ctx.get('Origin')
    if (ALLOWED_ORIGINS.includes(origin)) return origin
    return ''
  },
  credentials: true,
}))

app.use(helmet())
app.use(bodyParser())

app.use(routes.routes())

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`ssumpay-server running on port ${PORT}`)
})
