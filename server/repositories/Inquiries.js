const Base = require('./Base')
const Inquiry = require('../entities/Inquiry')
const db = require('../db')

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
      .whereNull('inquiries.deletedAt')
      .orderBy('inquiries.createdAt', 'desc')
    if (status) query = query.where('inquiries.status', status)
    if (type) query = query.where('inquiries.type', type)

    const [items, total] = await Promise.all([
      query.clone().limit(limit).offset(offset),
      query.clone().resultSize()
    ])
    return { items, total }
  }

  async findByIdWithMember(id) {
    return Inquiry.query().findById(id).withGraphJoined('member')
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
