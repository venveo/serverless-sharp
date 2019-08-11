module.exports = class NotImplementedException extends Error {
  constructor (args) {
    super(args)
    this.name = 'NotImplemented'
    this.status = 501
    this.message = 'Sorry, this transform is not implemented yet. Open a PR! https://github.com/venveo/serverless-sharp'
  }
}
