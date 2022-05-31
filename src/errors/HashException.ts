import HttpError from "./HttpError";

export default class ExpectationTypeException extends HttpError {
  constructor(message = 'Invalid security hash') {
    super()
    this.name = 'HashException'
    this.status = 403
    this.message = message
  }
}
