const { Model } = require('objection')

class Product extends Model {
  static get tableName() { return 'products' }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['category', 'subcategory', 'name', 'price'],
      properties: {
        id: { type: 'integer' },
        category: { type: 'string' },
        subcategory: { type: 'string' },
        name: { type: 'string' },
        price: { type: 'integer', minimum: 0 },
        lexAmount: { type: 'integer', minimum: 0 },
        coinAmount: { type: 'integer', minimum: 0 },
        isActive: { type: 'integer', enum: [0, 1] },
        sortOrder: { type: 'integer' }
      }
    }
  }
}

module.exports = Product
