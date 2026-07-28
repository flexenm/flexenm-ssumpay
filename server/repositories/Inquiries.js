const Base = require('./Base')
const Inquiry = require('../entities/Inquiry')
const db = require('../db')

// admin 응답에 회원 비밀번호 해시가 노출되지 않도록 member 조인 시 컬럼을 제한한다.
const SAFE_MEMBER_COLUMNS = ['id', 'username', 'name', 'email', 'phone', 'flexUsername', 'status', 'createdAt']

class Inquiries extends Base {
  constructor() {
    super(Inquiry)
  }

  async listByMember(memberId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      Inquiry.query()
        .where({ memberId })
        .whereNull('deletedAt')
        .select('id', 'type', 'title', 'status', 'createdAt', 'answeredAt')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset),
      Inquiry.query().where({ memberId }).whereNull('deletedAt').resultSize()
    ])
    return { items, total }
  }

  async findByIdForMember(id, memberId) {
    return Inquiry.query().findById(id).where({ memberId }).whereNull('deletedAt')
  }

  async softDeleteById(id) {
    return Inquiry.query().findById(id).patch({ deletedAt: new Date().toISOString() })
  }

  async listForAdmin({ page = 1, limit = 20, status, type } = {}) {
    const offset = (page - 1) * limit
    let query = Inquiry.query()
      .withGraphJoined('member')
      .modifyGraph('member', (builder) => builder.select(...SAFE_MEMBER_COLUMNS))
      .whereNull('inquiries.deletedAt')
      .orderBy('inquiries.createdAt', 'desc')
    if (status) query = query.where('inquiries.status', status)
    if (type) query = query.where('inquiries.type', type)

    // withGraphJoined + modifyGraph 조합은 프로세스 최초 실행 시 Objection이
    // 테이블 메타데이터를 비동기로 가져오는데, 두 clone()을 Promise.all로 동시 실행하면
    // 그 fetch가 끝나기 전에 두 번째 빌드가 시작되어 레이스로 실패할 수 있다 (순차 실행으로 회피).
    const items = await query.clone().limit(limit).offset(offset)
    const total = await query.clone().resultSize()
    return { items, total }
  }

  async findByIdWithMember(id) {
    return Inquiry.query().findById(id).withGraphJoined('member').modifyGraph('member', (builder) => builder.select(...SAFE_MEMBER_COLUMNS))
  }

  async patchAnswer(id, answer) {
    return Inquiry.query().patchAndFetchById(id, {
      answer,
      status: 1,
      answeredAt: db.raw('NOW()')
    })
  }

  async countPending() {
    const row = await db('inquiries').where({ status: 0 }).count('id as cnt').first()
    return row.cnt
  }
}

module.exports = new Inquiries()
