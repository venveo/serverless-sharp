exports.apply = (image, edits) => {
  if (edits.bri) {
    this.bri(image, edits.bri.processedValue)
  }
  if (edits.sharp) {
    this.sharp(image)
  }
}

/**
 *
 * @param {Sharp} image
 * @param {number} val
 */
exports.bri = (image, val) => {
  // TODO: This is wrong! Brightness in imgix is -200-200 for SOME REASON??
  // Also, it doesn't scale nicely to Sharp. Sharp doesn't go completely black
  image.modulate({
    brightness: val
  })
}

/**
 *
 * @param {Sharp} image
 */
exports.sharp = (image) => {
  image.sharpen()
}
