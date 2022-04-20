import HttpError from "./HttpError";

export default class SettingsException extends HttpError {
  constructor (message = 'Invalid configuration') {
    super()
    this.name = 'SettingsException'
    this.status = 500
    this.message = message
  }
}
