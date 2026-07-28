const Base = require('./Base')
const Order = require('../entities/Order')
const db = require('../db')

// admin 응답에 회원 비밀번호 해시가 노출되지 않도록 member 조인 시 컬럼을 제한한다.
const SAFE_MEMBER_COLUMNS = ['id', 'username', 'name', 'email', 'phone', 'flexUsername', 'status', 'createdAt']

class Orders extends Base {
  constructor() {
    super(Order)
  }

  async listByMember(memberId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      Order.query()
        .where({ memberId })
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset),
      Order.query().where({ memberId }).resultSize()
    ])
    return { items, total }
  }

  async findByOrderNoForMember(orderNo, memberId) {
    return Order.query()
      .findOne({ orderNo, memberId })
      .withGraphJoined('product')
  }

  async searchForAdmin({ page = 1, limit = 20, paymentStatus, chargeStatus, keyword, startDate, endDate } = {}) {
    const offset = (page - 1) * limit
    let query = Order.query().withGraphJoined('member').modifyGraph('member', (builder) => builder.select(...SAFE_MEMBER_COLUMNS)).orderBy('orders.createdAt', 'desc')

    if (paymentStatus) query = query.where('orders.paymentStatus', paymentStatus)
    if (chargeStatus) query = query.where('orders.chargeStatus', chargeStatus)
    if (keyword) {
      query = query.where((q) => {
        q.where('orders.orderNo', 'like', `%${keyword}%`)
          .orWhere('member.username', 'like', `%${keyword}%`)
          .orWhere('orders.flexUsername', 'like', `%${keyword}%`)
      })
    }
    if (startDate) query = query.where('orders.createdAt', '>=', startDate)
    if (endDate) query = query.where('orders.createdAt', '<=', `${endDate} 23:59:59`)

    // withGraphJoined + modifyGraph 조합은 프로세스 최초 실행 시 Objection이
    // 테이블 메타데이터를 비동기로 가져오는데, 두 clone()을 Promise.all로 동시 실행하면
    // 그 fetch가 끝나기 전에 두 번째 빌드가 시작되어 레이스로 실패할 수 있다 (순차 실행으로 회피).
    const items = await query.clone().limit(limit).offset(offset)
    const total = await query.clone().resultSize()
    return { items, total }
  }

  async findByIdWithMemberAndProduct(id) {
    return Order.query().findById(id).withGraphJoined('[member, product]').modifyGraph('member', (builder) => builder.select(...SAFE_MEMBER_COLUMNS))
  }

  async patchChargeStatus(id, updates) {
    return Order.query().patchAndFetchById(id, updates)
  }

  async patchMemo(id, memo) {
    return Order.query().patchAndFetchById(id, { memo })
  }

  async countToday() {
    const row = await db('orders').whereRaw('DATE(createdAt) = CURDATE()').count('id as cnt').first()
    return row.cnt
  }

  async countPendingCharge() {
    const row = await db('orders').where({ paymentStatus: 1, chargeStatus: 0 }).count('id as cnt').first()
    return row.cnt
  }

  async salesByDay(days = 7) {
    return db('orders')
      .where({ paymentStatus: 1 })
      .whereRaw(`createdAt >= DATE_SUB(NOW(), INTERVAL ${Number(days)} DAY)`)
      .groupByRaw('DATE(createdAt)')
      .select(db.raw('DATE(createdAt) as date'), db.raw('SUM(price) as total'))
      .orderBy('date', 'asc')
  }
}

module.exports = new Orders()
