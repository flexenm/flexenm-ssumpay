const Base = require('./Base')
const Order = require('../entities/Order')
const db = require('../db')
const { MEMBER_SAFE_COLUMNS } = require('../const')

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
    let query = Order.query().withGraphJoined('member').modifyGraph('member', (builder) => builder.select(...MEMBER_SAFE_COLUMNS)).orderBy('orders.createdAt', 'desc')

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
    return Order.query().findById(id).withGraphJoined('[member, product]').modifyGraph('member', (builder) => builder.select(...MEMBER_SAFE_COLUMNS))
  }
  
  async patchChargeStatus(id, updates) {
    return Order.query().patchAndFetchById(id, updates)
  }
  // paymentStatus=0(대기)일 때만 갱신 — 승인 확인/웹훅이 중복 도착해도 한 번만 반영되도록 멱등하게 처리
  async markPaymentDone(orderNo, { pgTrxNo, pgTid } = {}) {
    return Order.query()
      .patch({ paymentStatus: 1, pgTrxNo, pgTid, paidAt: new Date().toISOString() })
      .where({ orderNo, paymentStatus: 0 })
  }

  async findByOrderNo(orderNo) {
    return Order.query().findOne({ orderNo })
  }

  async attachVirtualAccount(orderNo, { virtualAccountNo, virtualAccountBank, virtualAccountExpiredAt }) {
    return Order.query().patch({ virtualAccountNo, virtualAccountBank, virtualAccountExpiredAt }).where({ orderNo })
  }

  // 결제 취소 확정. 이미 취소(2)면 덮어쓰지 않도록 현재 상태를 조건에 건다.
  async markPaymentCancelled(id, fromStatus) {
    return Order.query().patch({ paymentStatus: 2 }).where({ id, paymentStatus: fromStatus })
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
