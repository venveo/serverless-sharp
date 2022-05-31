import HttpError from "./HttpError";

export default class InvalidDimensionsException extends HttpError {
  constructor(message: string|undefined = undefined) {
    super()
    this.name = 'InvalidDimensions'
    this.status = 400
    this.message = message ?? 'The output dimensions you provided do not meet the requirements of the requested transform.'
  }
}
