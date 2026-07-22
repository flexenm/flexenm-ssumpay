const Router = require('koa-router')
const db = require('../../db')

const router = new Router()

router.get('/', async ctx => {
  const [
    totalMembers,
    todayOrders,
    pendingCharges,
    pendingInquiries
  ] = await Promise.all([
    db('members').count('id as cnt').first(),
    db('orders').whereRaw('DATE(createdAt) = CURDATE()').count('id as cnt').first(),
    db('orders').where({ paymentStatus: 1, chargeStatus: 0 }).count('id as cnt').first(),
    db('inquiries').where({ status: 0 }).count('id as cnt').first()
  ])

  const salesByDay = await db('orders')
    .where({ paymentStatus: 1 })
    .whereRaw('createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)')
    .groupByRaw('DATE(createdAt)')
    .select(db.raw('DATE(createdAt) as date'), db.raw('SUM(price) as total'))
    .orderBy('date', 'asc')

  ctx.body = {
    code: 200,
    data: {
      totalMembers: totalMembers.cnt,
      todayOrderCount: todayOrders.cnt,
      pendingCharges: pendingCharges.cnt,
      pendingInquiries: pendingInquiries.cnt,
      salesByDay
    }
  }
})

module.exports = router