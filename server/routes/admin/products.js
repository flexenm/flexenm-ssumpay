const Router = require('koa-router')
const productService = require('../../services/product')
const { wrap } = require('../shared/handler-wrap')

const router = new Router()

router.get(
  '/',
  wrap(async ({ category, subcategory, isActive, keyword }) => {
    return await productService.listForAdmin({ category, subcategory, isActive, keyword })
  })
)

router.post(
  '/',
  wrap(async ({ category, subcategory, name, price, lexAmount, coinAmount, sort }) => {
    return await productService.createProduct({ category, subcategory, name, price, lexAmount, coinAmount, sort })
  })
)

router.put(
  '/:id',
  wrap(async ({ id, category, subcategory, name, price, lexAmount, coinAmount, isActive, sort }) => {
    return await productService.updateProduct(id, { category, subcategory, name, price, lexAmount, coinAmount, isActive, sort })
  })
)

router.delete(
  '/:id',
  wrap(async ({ id }) => {
    await productService.deleteProduct(id)
    return { message: '상품이 삭제되었습니다.' }
  })
)

module.exports = router
