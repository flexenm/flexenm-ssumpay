const Router = require('koa-router')
const productService = require('../../services/product')
const { wrap } = require('../shared/handler-wrap')

const router = new Router()

router.get(
  '/',
  wrap(async ({ category, subcategory }) => {
    return await productService.listActive({ category, subcategory })
  })
)

router.get(
  '/:id',
  wrap(async ({ id }) => {
    return await productService.getActiveById(id)
  })
)

module.exports = router
