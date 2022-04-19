export default class ExpectationTypeException extends Error {
  constructor (message) {
    super()
    this.name = 'ExpectationType'
    this.status = 400
    this.message = message
  }
}
