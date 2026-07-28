const Base = require('./Base')
const Admin = require('../entities/Admin')

class Admins extends Base {
  constructor() {
    super(Admin)
  }

  async findActiveByUsername(username) {
    return Admin.query().findOne({ username, isActive: 1 })
  }
}

module.exports = new Admins()
