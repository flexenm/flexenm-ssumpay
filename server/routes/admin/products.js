const Router = require('koa-router')
const Product = require('../../entities/Product')

const router = new Router()

router.get('/', async ctx => {
  const { category, subcategory, isActive } = ctx.query

  let query = Product.query().whereNull('deletedAt').orderBy('sort').orderBy('id')
  if (category) query = query.where({ category })
  if (subcategory) query = query.where({ subcategory })
  if (isActive !== undefined) query = query.where({ isActive })

  ctx.body = { code: 200, data: await query }
})

router.post('/', async ctx => {
  const { category, subcategory, name, price, lexAmount, coinAmount, sort } = ctx.request.body
  if (!category || !subcategory || !name || price === undefined) {
    ctx.status = 400
    ctx.body = { code: 400, message: '필수 항목을 입력해주세요.' }
    return
  }

  const product = await Product.query().insertAndFetch({
    category, subcategory, name, price,
    lexAmount: lexAmount || 0,
    coinAmount: coinAmount || 0,
    sort: sort || 0,
    isActive: 1
  })

  ctx.status = 201
  ctx.body = { code: 201, data: product }
})

router.put('/:id', async ctx => {
  const product = await Product.query().findById(ctx.params.id)
  if (!product) {
    ctx.status = 404
    ctx.body = { code: 404, message: '상품을 찾을 수 없습니다.' }
    return
  }

  const { category, subcategory, name, price, lexAmount, coinAmount, isActive, sort } = ctx.request.body
  const updated = await Product.query().patchAndFetchById(ctx.params.id, {
    category, subcategory, name, price, lexAmount, coinAmount, isActive, sort
  })

  ctx.body = { code: 200, data: updated }
})

router.delete('/:id', async ctx => {
  await Product.query().patchById(ctx.params.id, { deletedAt: new Date().toISOString() })
  ctx.body = { code: 200, message: '상품이 삭제되었습니다.' }
})

module.exports = router
