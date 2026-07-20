const { Model } = require('objection')

class Member extends Model {
  static get tableName() { return 'members' }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['username', 'password', 'name', 'email'],
      properties: {
        id: { type: 'integer' },
        username: { type: 'string', minLength: 4, maxLength: 50 },
        password: { type: 'string' },
        name: { type: 'string', maxLength: 50 },
        email: { type: 'string', format: 'email' },
        phone: { type: ['string', 'null'] },
        flexUsername: { type: ['string', 'null'] },
        status: { type: 'integer', enum: [0, 1] }
      }
    }
  }
}

module.exports = Member
