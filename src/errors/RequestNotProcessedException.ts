import HttpError from "./HttpError";

export default class RequestNotProcessedException extends HttpError {

  constructor(message: string) {
    super()
    this.name = 'RequestNotProcessedException'
    this.status = 500
    this.message = message
  }
}
