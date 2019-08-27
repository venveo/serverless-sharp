const sharp = require('sharp')

const NotImplementedException = require('../errors/NotImplementedException')

exports.apply = async (image, edits) => {
  const { w, h, fit, crop } = edits
  if (w.processedValue || h.processedValue) {
    switch (fit.processedValue) {
      case 'clamp':
        // https://github.com/venveo/serverless-sharp/issues/26
        // Should extends the edge pixels outwards to match the given dimensions.
        // Not currently possible in Sharp.
        throw new NotImplementedException()
      case 'fillmax':
        // https://github.com/venveo/serverless-sharp/issues/27
        // Should resize the image while preserving aspect ratio within the dimensions given.
        // If the width or height exceeds the available width and height, fill with solid color or blurred image
        // Should be partially possible in Sharp. Just not a priority
        throw new NotImplementedException()
      case 'max':
        // https://github.com/venveo/serverless-sharp/issues/28
        throw new NotImplementedException()
      case 'min':
        // https://github.com/venveo/serverless-sharp/issues/28
        throw new NotImplementedException()
      case 'fill':
        await this.fill(image, w.processedValue, h.processedValue, edits['fill-color'].processedValue)
        break
      case 'scale':
        this.scale(image, w.processedValue, h.processedValue)
        break
      case 'crop':
        await this.scaleCrop(image, w.processedValue, h.processedValue, crop.processedValue, edits['fp-x'].processedValue, edits['fp-y'].processedValue)
        break
      case 'clip':
        this.scaleClip(image, w.processedValue, h.processedValue)
        break
    }
  }
}

/**
 *
 * @param {Sharp} image
 * @param width
 * @param height
 * @returns {*}
 */
exports.scaleClip = (image, width = null, height = null) => {
  image.resize({
    width: width,
    height: height,
    withoutEnlargement: true,
    fit: sharp.fit.inside
  })
}

/**
 *
 * @param {Sharp} image
 * @param width
 * @param height
 * @param color
 * @returns {*}
 */
exports.fill = async (image, width = null, height = null, color = null) => {
  const resizeParams = {
    withoutEnlargement: false,
    fit: sharp.fit.contain
  }
  if (width) {
    resizeParams.width = width
  }
  if (height) {
    resizeParams.height = height
  }
  // TODO: Validate color more explicitly
  if (color) {
    resizeParams.background = color
  }
  image.resize(resizeParams)
}

/**
 * Stretch an image to fit the dimensions requested
 * @param {Sharp} image
 * @param width
 * @param height
 * @returns {*}
 */
exports.scale = (image, width, height) => {
  image.resize({
    width: width,
    height: height,
    withoutEnlargement: true,
    fit: sharp.fit.fill
  })
}

/**
 * Handle cropping modes
 * @param {Sharp} image
 * @param width
 * @param height
 * @param crop
 * @param fpx
 * @param fpy
 * @returns {*}
 */
exports.scaleCrop = async (image, width = null, height = null, crop = null, fpx = null, fpy = null) => {
  // top, bottom, left, right, faces, focalpoint, edges, and entropy
  // TODO: This should happen in the schemaParser
  if (!Array.isArray(crop)) {
    crop = []
  }

  // First we'll handle entropy mode - this one is simpler
  if (crop.includes('entropy')) {
    image.resize({
      width: width,
      height: height,
      withoutEnlargement: false,
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy
    })
    return
  }

  // Now handle focalpoint, and left, right, top, bottom
  // extract metadata from image to resize
  const metadata = await image.metadata()

  const originalWidth = parseFloat(metadata.width)
  const originalHeight = parseFloat(metadata.height)

  const ratio = originalWidth / originalHeight

  if (width && !height) {
    height = width / ratio
  }
  if (height && !width) {
    width = height * ratio
  }

  // compute new width & height
  const factor = Math.max(width / originalWidth, height / originalHeight)
  const newWidth = parseInt(originalWidth * factor)
  const newHeight = parseInt(originalHeight * factor)

  // if we don't have a focal point, default to center-center
  if (crop.length && crop[0] !== 'focalpoint') {
    fpx = 0.5
    fpy = 0.5

    // use position arguments to set focal point, if provided
    if (crop.includes('left')) {
      fpx = 0
    } else if (crop.includes('right')) {
      fpx = 1
    }
    if (crop.includes('top')) {
      fpy = 0
    } else if (crop.includes('bottom')) {
      fpy = 1
    }
  }

  let fpxLeft = Math.floor((newWidth * fpx) - (0.5 * width))
  let fpyTop = Math.floor((newHeight * fpy) - (0.5 * height))

  // ensure extracted region doesn't exceed image bounds
  if (width > newWidth) {
    width = newWidth
  }
  if (height > newHeight) {
    height = newHeight
  }

  // adjust focal point x
  if (fpxLeft + width > newWidth) {
    fpxLeft = newWidth - width
  } else if (fpxLeft < 0) {
    fpxLeft = 0
  }

  // adjust focal point y
  if (fpyTop + height > newHeight) {
    fpyTop = newHeight - height
  } else if (fpyTop < 0) {
    fpyTop = 0
  }
  image.resize({
    width: newWidth,
    height: newHeight,
    withoutEnlargement: false,
    fit: sharp.fit.fill
  }).extract({
    left: fpxLeft,
    top: fpyTop,
    width: width,
    height: height
  })
}
