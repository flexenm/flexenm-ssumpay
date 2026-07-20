const { Model } = require('objection')

class Notice extends Model {
  static get tableName() { return 'notices' }
}

module.exports = Notice