const { Model } = require('objection')

class Member extends Model {
  static get tableName() { return 'members' }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['username', 'password', 'name', 'email'],
      properties: {
        id: { type: 'integer' },
        username: { type: 'string', minLength: 6, maxLength: 15 },
        password: { type: 'string' },
        name: { type: 'string', maxLength: 50 },
        email: { type: 'string', format: 'email' },
        phone: { type: ['string', 'null'] },
        flexUsername: { type: ['string', 'null'] },
        status: { type: 'integer', enum: [0, 1] }
      }
    }
  }

  static get relationMappings() {
    const Order = require('./Order')
    const Inquiry = require('./Inquiry')
    return {
      orders: {
        relation: Model.HasManyRelation,
        modelClass: Order,
        join: { from: 'members.id', to: 'orders.memberId' }
      },
      inquiries: {
        relation: Model.HasManyRelation,
        modelClass: Inquiry,
        join: { from: 'members.id', to: 'inquiries.memberId' }
      }
    }
  }
}

module.exports = Member
