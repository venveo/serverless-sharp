module.exports = class SettingsException extends Error {
  constructor (message = 'Invalid configuration') {
    super()
    this.name = 'SettingsException'
    this.status = 500
    this.message = message
  }
}
