const Base = require('./Base')
const Product = require('../entities/Product')

class Products extends Base {
  constructor() {
    super(Product)
  }

  async findActiveById(id) {
    return Product.query().findById(id).where({ isActive: 1 })
  }

  async findActiveByIdAndNotDeleted(id) {
    return Product.query().findById(id).where({ isActive: 1 }).whereNull('deletedAt')
  }

  async listActive({ category, subcategory } = {}) {
    let query = Product.query().where({ isActive: 1 }).whereNull('deletedAt').orderBy('sort').orderBy('id')
    if (category) query = query.where({ category })
    if (subcategory) query = query.where({ subcategory })
    return query
  }

  async listForAdmin({ category, subcategory, isActive, keyword } = {}) {
    let query = Product.query().whereNull('deletedAt').orderBy('sort').orderBy('id')
    if (category) query = query.where({ category })
    if (subcategory) query = query.where({ subcategory })
    if (isActive !== undefined) query = query.where({ isActive })
    if (keyword) query = query.where('name', 'like', `%${keyword}%`)
    return query
  }

  async softDeleteById(id) {
    return this.patchById(id, { deletedAt: new Date().toISOString() })
  }
}

module.exports = new Products()
