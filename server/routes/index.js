const Router = require('koa-router')

const UserError = require('../utils/UserError')
const adminRouter = require('./admin')
const apiRouter = require('./api')

const router = new Router()

router.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof UserError) {
      ctx.status = err.code || 400
      ctx.body = { code: ctx.status, message: err.message }
    } else {
      throw err
    }
  }
})

// 헬스체크
router.get('/health', ctx => { ctx.body = { status: 'ok' } })

router.use(adminRouter.routes(), adminRouter.allowedMethods())
router.use(apiRouter.routes(), apiRouter.allowedMethods())

module.exports = router