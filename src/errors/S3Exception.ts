import HttpError from "./HttpError";

export default class S3Exception extends HttpError {
  code: string
  constructor (status: number, code: string, message: string) {
    super()
    this.name = 'S3Exception'
    this.status = status || 404
    this.code = code
    this.message = message
  }
}
