const Router = require('koa-router')
const productService = require('../../services/product')

const router = new Router()

router.get('/', async ctx => {
  const { category, subcategory, isActive, keyword } = ctx.query
  ctx.body = { code: 200, data: await productService.listForAdmin({ category, subcategory, isActive, keyword }) }
})

router.post('/', async ctx => {
  const product = await productService.createProduct(ctx.request.body)
  ctx.status = 201
  ctx.body = { code: 201, data: product }
})

router.put('/:id', async ctx => {
  const updated = await productService.updateProduct(ctx.params.id, ctx.request.body)
  ctx.body = { code: 200, data: updated }
})

router.delete('/:id', async ctx => {
  await productService.deleteProduct(ctx.params.id)
  ctx.body = { code: 200, message: '상품이 삭제되었습니다.' }
})

module.exports = router
