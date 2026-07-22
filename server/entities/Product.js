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
        sort: { type: 'integer' },
        deletedAt: { type: ['string', 'null'] }
      }
    }
  }

  static get relationMappings() {
    const Order = require('./Order')
    return {
      orders: {
        relation: Model.HasManyRelation,
        modelClass: Order,
        join: { from: 'products.id', to: 'orders.productId' }
      }
    }
  }
}

module.exports = Product
