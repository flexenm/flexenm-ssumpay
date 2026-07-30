class UserError extends Error {
  constructor(message, code) {
    super()
    this.message = message
    this.code = code
    this.status = code
  }
}
module.exports = UserError