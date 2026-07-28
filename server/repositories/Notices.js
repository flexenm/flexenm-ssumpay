const { raw } = require('objection')
const Base = require('./Base')
const Notice = require('../entities/Notice')

class Notices extends Base {
  constructor() {
    super(Notice)
  }

  async listActive({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      Notice.query()
        .where({ isActive: 1 })
        .orderBy('isPinned', 'desc')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset),
      Notice.query().where({ isActive: 1 }).resultSize()
    ])
    return { items, total }
  }

  async findActiveById(id) {
    return Notice.query().findById(id).where({ isActive: 1 })
  }

  async incrementViewCount(id) {
    return Notice.query().patch({ viewCount: raw('viewCount + 1') }).where({ id })
  }

  async listForAdmin({ page = 1, limit = 20, keyword, isPinned } = {}) {
    const offset = (page - 1) * limit
    let query = Notice.query().orderBy('isPinned', 'desc').orderBy('createdAt', 'desc')
    if (keyword) query = query.where('title', 'like', `%${keyword}%`)
    if (isPinned !== undefined && isPinned !== '') query = query.where({ isPinned })

    const [items, total] = await Promise.all([
      query.clone().limit(limit).offset(offset),
      query.clone().resultSize()
    ])
    return { items, total }
  }
}

module.exports = new Notices()
