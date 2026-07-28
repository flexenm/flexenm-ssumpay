const Base = require('./Base')
const Member = require('../entities/Member')
const db = require('../db')

const ADMIN_LIST_COLUMNS = ['id', 'username', 'name', 'email', 'phone', 'flexUsername', 'status', 'createdAt']

class Members extends Base {
  constructor() {
    super(Member)
  }

  async findByUsername(username) {
    return Member.query().findOne({ username })
  }

  async findByUsernameOrEmail(username, email) {
    return Member.query()
      .where((q) => q.where({ username }).orWhere({ email }))
      .first()
  }

  async listForAdmin({ page = 1, limit = 20, keyword, status } = {}) {
    const offset = (page - 1) * limit
    let query = Member.query().select(...ADMIN_LIST_COLUMNS).orderBy('createdAt', 'desc')

    if (keyword) {
      query = query.where((q) => {
        q.where('username', 'like', `%${keyword}%`)
          .orWhere('name', 'like', `%${keyword}%`)
          .orWhere('email', 'like', `%${keyword}%`)
      })
    }
    if (status) query = query.where({ status })

    const [items, total] = await Promise.all([
      query.clone().limit(limit).offset(offset),
      query.clone().resultSize()
    ])
    return { items, total }
  }

  async findByIdForAdmin(id) {
    return Member.query().findById(id).select(...ADMIN_LIST_COLUMNS)
  }

  async patchStatus(id, status) {
    return Member.query().patchAndFetchById(id, { status })
  }

  async countAll() {
    const row = await db('members').count('id as cnt').first()
    return row.cnt
  }
}

module.exports = new Members()
