const Router = require('koa-router')
const productService = require('../../services/product')

const router = new Router()

router.get('/', async ctx => {
  const { category, subcategory } = ctx.query
  ctx.body = { code: 200, data: await productService.listActive({ category, subcategory }) }
})

router.get('/:id', async ctx => {
  const product = await productService.getActiveById(ctx.params.id)
  ctx.body = { code: 200, data: product }
})

module.exports = router
