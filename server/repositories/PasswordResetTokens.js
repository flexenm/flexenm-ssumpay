const Base = require('./Base')
const PasswordResetToken = require('../entities/PasswordResetToken')

class PasswordResetTokens extends Base {
  constructor() {
    super(PasswordResetToken)
  }

  async deleteActiveByMember(memberId) {
    return PasswordResetToken.query().delete().where({ memberId }).whereNull('usedAt')
  }

  async findActiveByHashedToken(hashedToken) {
    return PasswordResetToken.query()
      .findOne({ token: hashedToken })
      .whereNull('usedAt')
      .where('expiresAt', '>', new Date())
  }

  async markUsed(id, trx) {
    return PasswordResetToken.query(trx)
      .patch({ usedAt: new Date() })
      .where({ id })
      .whereNull('usedAt')
  }

  transaction(callback) {
    return PasswordResetToken.transaction(callback)
  }
}

module.exports = new PasswordResetTokens()
