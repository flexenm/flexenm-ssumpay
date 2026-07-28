const Router = require('koa-router')
const adminService = require('../../services/admin')

const router = new Router()

router.get('/', async ctx => {
  ctx.body = { code: 200, data: await adminService.getDashboardStats() }
})

module.exports = router
