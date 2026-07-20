const Router = require('koa-router')
const Order = require('../../entities/Order')
const Product = require('../../entities/Product')
const userAuth = require('../../middlewares/user-auth')

const router = new Router()

router.use(userAuth)

router.post('/', async ctx => {
  const { productId, flexUsername, paymentMethod = 1 } = ctx.request.body
  const memberId = ctx.state.member.id

  if (!productId || !flexUsername) {
    ctx.status = 400
    ctx.body = { code: 400, message: '상품과 FlexTV 아이디를 입력해주세요.' }
    return
  }

  const product = await Product.query().findById(productId).where({ isActive: 1 })
  if (!product) {
    ctx.status = 404
    ctx.body = { code: 404, message: '상품을 찾을 수 없습니다.' }
    return
  }

  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const datePart = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const orderNo = `SP${datePart}${Math.floor(Math.random() * 9000) + 1000}`

  const order = await Order.query().insertAndFetch({
    orderNo,
    memberId,
    productId: product.id,
    productName: product.name,
    price: product.price,
    flexUsername,
    paymentMethod,
    paymentStatus: 0,
    chargeStatus: 0,
    ipAddr: ctx.ip
  })

  ctx.status = 201
  ctx.body = { code: 201, data: { orderNo: order.orderNo, id: order.id, price: order.price } }
})

router.get('/my', async ctx => {
  const { page = 1, limit = 10 } = ctx.query
  const offset = (page - 1) * limit
  const memberId = ctx.state.member.id

  const [items, total] = await Promise.all([
    Order.query().where({ memberId }).orderBy('createdAt', 'desc').limit(limit).offset(offset),
    Order.query().where({ memberId }).resultSize()
  ])

  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:orderNo', async ctx => {
  const order = await Order.query()
    .findOne({ orderNo: ctx.params.orderNo, memberId: ctx.state.member.id })
    .withGraphJoined('product')

  if (!order) {
    ctx.status = 404
    ctx.body = { code: 404, message: '주문을 찾을 수 없습니다.' }
    return
  }

  ctx.body = { code: 200, data: order }
})

module.exports = router
