export function apply(image, edits) {
  if (edits.blur) {
    blur(image, edits.blur.processedValue)
  }
}

/**
 *
 * @param {sharp} image
 * @param {number} val
 */
export function blur(image, val) {
  if (val === 0) {
    return
  }
  // We need to convert Imgix's scale of int(0) - int(2000) to float(0.3) - float(1000)
  let result = ((val - 0) / (2000 - 0)) * (1000 - 0.3) + 0.3
  // Seems like Imgix blurs a little less than we do, so this is just a magic number to make them more similar
  result *= 0.22
  image.blur(result)
}

export default {
  blur,
  apply
}