const Router = require('koa-router')
const adminService = require('../../services/admin')
const { wrap } = require('../shared/handler-wrap')

const router = new Router()

router.get(
  '/',
  wrap(async () => {
    return await adminService.getDashboardStats()
  })
)

module.exports = router
