const { Model } = require('objection')
const Member = require('./Member')

class Inquiry extends Model {
  static get tableName() { return 'inquiries' }

  static get relationMappings() {
    return {
      member: {
        relation: Model.BelongsToOneRelation,
        modelClass: Member,
        join: { from: 'inquiries.memberId', to: 'members.id' }
      }
    }
  }
}

module.exports = Inquiry
