import HttpError from "./HttpError";

export default class ExpectationTypeException extends HttpError {

  constructor(message: string) {
    super()
    this.name = 'ExpectationType'
    this.status = 400
    this.message = message
  }
}
