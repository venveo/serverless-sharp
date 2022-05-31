export default class ColorException extends Error {
  constructor(color: string) {
    super()
    this.name = 'ColorException'
    this.message = 'Could not handle input color: ' + color
  }
}
