const Router = require('koa-router')

const adminRouter = require('./admin')
const apiRouter = require('./api')

const router = new Router()

// 헬스체크
router.get('/health', ctx => { ctx.body = { status: 'ok' } })

router.use(adminRouter.routes(), adminRouter.allowedMethods())
router.use(apiRouter.routes(), apiRouter.allowedMethods())

module.exports = router