const Router = require('koa-router')
const Order = require('../../entities/Order')
const db = require('../../db')

const router = new Router()

router.get('/', async ctx => {
  const { page = 1, limit = 20, paymentStatus, chargeStatus, keyword, startDate, endDate } = ctx.query
  const offset = (page - 1) * limit

  let query = Order.query().withGraphJoined('member').orderBy('orders.createdAt', 'desc')

  if (paymentStatus) query = query.where('orders.paymentStatus', paymentStatus)
  if (chargeStatus) query = query.where('orders.chargeStatus', chargeStatus)
  if (keyword) {
    query = query.where(q => {
      q.where('orders.orderNo', 'like', `%${keyword}%`)
        .orWhere('member.username', 'like', `%${keyword}%`)
        .orWhere('orders.flexUsername', 'like', `%${keyword}%`)
    })
  }
  if (startDate) query = query.where('orders.createdAt', '>=', startDate)
  if (endDate) query = query.where('orders.createdAt', '<=', `${endDate} 23:59:59`)

  const [items, total] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    query.clone().resultSize()
  ])

  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:id', async ctx => {
  const order = await Order.query().findById(ctx.params.id).withGraphJoined('[member, product]')
  if (!order) {
    ctx.status = 404
    ctx.body = { code: 404, message: '주문을 찾을 수 없습니다.' }
    return
  }
  ctx.body = { code: 200, data: order }
})

router.patch('/:id/charge-status', async ctx => {
  const { chargeStatus, memo } = ctx.request.body
  const order = await Order.query().findById(ctx.params.id)
  if (!order) {
    ctx.status = 404
    ctx.body = { code: 404, message: '주문을 찾을 수 없습니다.' }
    return
  }

  if (![0, 1, 2].includes(Number(chargeStatus))) {
    ctx.status = 400
    ctx.body = { code: 400, message: '유효하지 않은 충전 상태입니다.' }
    return
  }

  const updates = { chargeStatus: Number(chargeStatus) }
  if (Number(chargeStatus) === 1) updates.chargedAt = db.raw('NOW()')
  if (memo !== undefined) updates.memo = memo

  await Order.query().patchAndFetchById(ctx.params.id, updates)
  ctx.body = { code: 200, message: '충전 상태가 변경되었습니다.' }
})

router.patch('/:id/memo', async ctx => {
  const { memo } = ctx.request.body
  const order = await Order.query().findById(ctx.params.id)
  if (!order) {
    ctx.status = 404
    ctx.body = { code: 404, message: '주문을 찾을 수 없습니다.' }
    return
  }
  await Order.query().patchAndFetchById(ctx.params.id, { memo })
  ctx.body = { code: 200, message: '메모가 저장되었습니다.' }
})

module.exports = router