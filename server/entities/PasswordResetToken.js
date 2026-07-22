const { Model } = require('objection')

class PasswordResetToken extends Model {
  static get tableName() { return 'password_reset_tokens' }

  static get relationMappings() {
    const Member = require('./Member')
    return {
      member: {
        relation: Model.BelongsToOneRelation,
        modelClass: Member,
        join: { from: 'password_reset_tokens.memberId', to: 'members.id' }
      }
    }
  }
}

module.exports = PasswordResetToken
