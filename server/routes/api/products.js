const Router = require('koa-router')
const Product = require('../../entities/Product')

const router = new Router()

router.get('/', async ctx => {
  const { category, subcategory } = ctx.query

  let query = Product.query().where({ isActive: 1 }).whereNull('deletedAt').orderBy('sort').orderBy('id')
  if (category) query = query.where({ category })
  if (subcategory) query = query.where({ subcategory })

  ctx.body = { code: 200, data: await query }
})

router.get('/:id', async ctx => {
  const product = await Product.query().findById(ctx.params.id).where({ isActive: 1 }).whereNull('deletedAt')
  if (!product) {
    ctx.status = 404
    ctx.body = { code: 404, message: '상품을 찾을 수 없습니다.' }
    return
  }
  ctx.body = { code: 200, data: product }
})

module.exports = router