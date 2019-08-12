module.exports = class InvalidDimensionsException extends Error {
  constructor (args) {
    super(args)
    this.name = 'InvalidDimensions'
    this.status = 400
    this.message = 'The output dimensions you provided do not meet the requirements of the requested transform.'
  }
}
