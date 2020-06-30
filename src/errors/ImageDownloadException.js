module.exports = class ImageDownloadException extends Error {
  constructor (status, message) {
    super()
    this.name = 'ImageDownloadException'
    this.status = status || 404
    this.message = message
  }
}
