import {getSetting} from "./utils/settings";

import ImageRequest from "./ImageRequest";
import * as imageOps from "./image-ops";

export default class ImageHandler {
  private readonly request: ImageRequest;

  constructor(request: ImageRequest) {
    if (!request.originalImageObject) {
      throw new Error('Image not found or request not fully processed!')
    }
    this.request = request
  }

  /**
   * Main method for processing image requests and outputting modified images.
   */
  async process() {
    // Get the original image
    const originalImageObject = this.request.originalImageObject
    const originalImageBody = this.request.originalImageBody

    let contentType = originalImageObject.ContentType

    let format
    let bufferImage
    // We have some edits to process
    if (Object.keys(this.request.edits).length) {
      try {
        // We're calling rotate on this immediately in order to ensure metadata for rotation doesn't get lost
        const pipeline = this.request.sharpObject.rotate()
        await this.applyEdits(pipeline, this.request.edits)
        await this.applyOptimizations(pipeline)
        bufferImage = await pipeline.toBuffer()
        format = pipeline.options.formatOut
      } catch (err) {
        console.error('Unhandlable image encountered', err)
        bufferImage = Buffer.from(originalImageBody, 'binary')
      }
    } else {
      // No edits, just return the original
      bufferImage = Buffer.from(originalImageBody, 'binary')
    }
    if (format) {
      switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'heif':
        contentType = 'image/avif'
        break
      case 'input':
        break
      default:
        console.warn('Unexpected output content type encountered: ' + contentType)
      }
    }

    return {
      CacheControl: originalImageObject.CacheControl,
      Body: bufferImage.toString('base64'),
      ContentType: contentType,
      ContentLength: Buffer.byteLength(bufferImage, 'base64')
    }
  }

  /**
   * Applies image modifications to the original image based on edits
   * specified in the ImageRequest.
   * @param {sharp} image - The original image.
   * @param {Object} edits - The edits to be made to the original image.
   */
  async applyEdits(image, edits) {
    await imageOps.restrictSize(image, this.request.originalMetadata)
    await imageOps.apply(image, edits)
  }

  /**
   * TODO: Move me out of here
   * @param image
   * @param edits
   * @param headers
   * @returns {Promise<sharp>}
   */
  async applyOptimizations(image) {
    // const minColors = 128 // arbitrary number
    // const maxColors = 256 * 256 * 256 // max colors in RGB color space
    const {edits, headers} = this.request
    const {auto} = edits

    let autoVals = auto.processedValue
    if (!Array.isArray(autoVals)) {
      autoVals = []
    }

    // Determine our quality - if it was implicitly determined, we'll use the environment setting rather than the schema
    let quality = getSetting('DEFAULT_QUALITY')
    if (edits.q.implicit !== true) {
      quality = parseInt(edits.q.processedValue)
      if (quality < 1) {
        quality = 1
      } else if (quality > 100) {
        quality = 100
      }
    }

    let fm = edits.fm.processedValue

    if (autoVals.includes('compress')) {
      quality = getSetting('DEFAULT_COMPRESS_QUALITY')
    }


    // adjust quality based on file type
    if (fm === 'jpg' || fm === 'jpeg') {
      if (autoVals.includes('compress') && quality < 100 && edits.q !== undefined) {
        image.jpeg({
          quality: quality,
          mozjpeg: true
        })
      } else {
        image.jpeg({
          quality: quality,
          trellisQuantisation: true
        })
      }
    } else if (fm === 'png') {
      image.png({
        quality: quality
      })
    } else if (fm === 'webp') {
      const options = {
        quality: quality
      }
      if ('lossless' in edits && edits.lossless.processedValue === true) {
        options.lossless = true
      }
      image.webp(options)
    } else if (fm === 'avif') {
      const options = {
        quality: quality
      }
      if ('lossless' in edits && edits.lossless.processedValue === true) {
        options.lossless = true
      }
      image.avif(options)
    } else {
      image.toFormat(fm)
    }

    return image
  }
}
