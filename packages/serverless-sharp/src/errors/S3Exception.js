module.exports = class S3Exception extends Error {
  constructor (status, code, message) {
    super()
    this.name = 'S3Exception'
    this.status = status || 404
    this.code = code
    this.message = message
  }
}
