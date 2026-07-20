const { Model } = require('objection')
const Member = require('./Member')
const Product = require('./Product')

class Order extends Model {
  static get tableName() { return 'orders' }

  static get relationMappings() {
    return {
      member: {
        relation: Model.BelongsToOneRelation,
        modelClass: Member,
        join: { from: 'orders.memberId', to: 'members.id' }
      },
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: { from: 'orders.productId', to: 'products.id' }
      }
    }
  }
}

module.exports = Order
