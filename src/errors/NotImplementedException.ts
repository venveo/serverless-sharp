import HttpError from "./HttpError";

export default class NotImplementedException extends HttpError {
  constructor() {
    super()
    this.name = 'NotImplemented'
    this.status = 501
    this.message = 'Sorry, this transform is not implemented yet. Open a PR! https://github.com/venveo/serverless-sharp'
  }
}
