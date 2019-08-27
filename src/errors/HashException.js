module.exports = class ExpectationTypeException extends Error {
  constructor () {
    super()
    this.name = 'HashException'
    this.status = 403
    this.message = 'Invalid security hash'
  }
}
