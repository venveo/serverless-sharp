module.exports = class ExpectationTypeException extends Error {
  constructor (message = 'Invalid security hash') {
    super()
    this.name = 'HashException'
    this.status = 403
    this.message = message
  }
}
