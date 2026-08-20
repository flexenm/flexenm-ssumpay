const Router = require('koa-router')

const UserError = require('../utils/UserError')
const adminRouter = require('./admin')
const apiRouter = require('./api')
const pgWebhookRouter = require('./webhooks/pg')

const router = new Router()

router.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof UserError) {
      ctx.status = err.code || 400
      ctx.body = { message: err.message }
    } else {
      throw err
    }
  }
})

// 헬스체크
router.get('/health', ctx => { ctx.body = { status: 'ok' } })

router.use(adminRouter.routes(), adminRouter.allowedMethods())
router.use(apiRouter.routes(), apiRouter.allowedMethods())
// 사용자 인증이 없는 PG 서버-투-서버 웹훅. userAuth 대신 PG 서명 검증으로 신뢰 경계를 둔다.
router.use(pgWebhookRouter.routes(), pgWebhookRouter.allowedMethods())

// 개발용 헥토 결제 테스트 페이지 — 운영에서는 HECTO_TEST_PAGE 를 설정하지 않는다.
if (process.env.HECTO_TEST_PAGE === '1') {
  const hectoTestRouter = require('./dev/hecto-test')
  router.use(hectoTestRouter.routes())
}

module.exports = router