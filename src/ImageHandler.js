const AWS = require('aws-sdk')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const ImageRequest = require('./ImageRequest')

const imageOps = require('./image-ops')

class ImageHandler {
  /**
   * @param {ImageRequest} request
   */
  constructor (request) {
    if (!(request instanceof ImageRequest)) {
      throw new Error('Expected request of type ImageRequest')
    }
    if (!request.originalImageObject) {
      throw new Error('Image not found or request not fully processed!')
    }
    this.request = request
  }

  /**
   * Main method for processing image requests and outputting modified images.
   */
  async process () {
    // Get the original image
    const originalImageObject = this.request.originalImageObject
    const originalImageBody = this.request.originalImageBody

    let format
    let bufferImage
    // We have some edits to process
    if (Object.keys(this.request.edits).length) {
      const modifiedImage = await this.applyEdits(originalImageBody, this.request.edits)
      const optimizedImage = await this.applyOptimizations(modifiedImage)
      bufferImage = await optimizedImage.toBuffer()
      format = optimizedImage.options.formatOut
    } else {
      // No edits, just return the original
      bufferImage = Buffer.from(originalImageBody, 'binary')
    }
    let contentType
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
      case 'svg':
        contentType = 'image/svg+xml'
        break
      default:
        contentType = originalImageObject.ContentType
    }
    return {
      CacheControl: originalImageObject.CacheControl,
      Body: bufferImage.toString('base64'),
      ContentType: contentType
    }
  }

  /**
   * Applies image modifications to the original image based on edits
   * specified in the ImageRequest.
   * @param {Buffer} originalImage - The original image.
   * @param {Object} edits - The edits to be made to the original image.
   */
  async applyEdits (originalImage, edits) {
    const image = sharp(originalImage)
    await imageOps.apply(image, edits)
    return image
  }

  /**
   * TODO: Move me out of here
   * @param image
   * @param edits
   * @param headers
   * @returns {Promise<Sharp>}
   */
  async applyOptimizations (image) {
    // const minColors = 128 // arbitrary number
    // const maxColors = 256 * 256 * 256 // max colors in RGB color space
    const { edits, headers } = this.request
    const { auto } = edits

    let autoVals = auto.processedValue
    if (!Array.isArray(autoVals)) {
      autoVals = []
    }

    // Determine our quality - if it was implicitly determined, we'll use the environment setting rather than the schema
    let quality = parseInt(process.env.DEFAULT_QUALITY)
    if (edits.q.implicit !== true) {
      quality = parseInt(edits.q.processedValue)
      if (quality < 1) {
        quality = 1
      } else if (quality > 100) {
        quality = 100
      }
    }

    // Get the image metadata and the initial format
    const metadata = await image.metadata()
    let fm = edits.fm.processedValue
    if (fm === null) {
      fm = metadata.format
    }

    if (autoVals.includes('compress')) {
      quality = parseInt(process.env.DEFAULT_COMPRESS_QUALITY)
      if (!metadata.hasAlpha && (fm === 'png' || fm === 'tiff')) {
        fm = 'jpeg'
      } else if (metadata.hasAlpha && fm === 'png') {
        fm = 'png'
      }
    }

    if (autoVals.includes('format')) {
      // If the browser supports webp, use webp for everything but gifs
      if (headers && 'Accept' in headers) {
        if (fm !== 'gif' && headers['Accept'].indexOf('image/webp') !== -1) {
          fm = 'webp'
        }
      }
    }

    // adjust quality based on file type
    if (fm === 'jpg' || fm === 'jpeg') {
      await image.jpeg({
        quality: quality,
        trellisQuantisation: true
      })
    } else if (fm === 'png') {
      // ensure that we do not reduce quality if param is not given
      if (autoVals.includes('compress') && quality < 100 && edits.q !== undefined) {
        const buffer = await image.toBuffer()
        const minQuality = quality - 20 > 0 ? quality - 20 : 0
        const pngQuantOptions = ['--speed', '3', '--quality', minQuality + '-' + quality, '-']
        const binaryLocation = this.findBin('pngquant')
        if (binaryLocation) {
          const pngquant = spawnSync(binaryLocation, pngQuantOptions, { input: buffer })
          image = sharp(pngquant.stdout)
        } else {
          console.warn('Skipping pngquant - could not find executable!')
          await image.png({
            quality: quality
          })
        }
      } else {
        await image.png({
          quality: quality
        })
      }
    } else if (fm === 'webp') {
      const options = {
        quality: quality
      }
      if ('lossless' in edits && edits.lossless === 'true') {
        options.lossless = true
      }
      await image.webp(options)
    } else {
      await image.toFormat(edits.fm)
    }

    return image
  }

  /**
   * TODO: Move me out of here
   * @param binName
   * @returns {string}
   */
  findBin (binName) {
    process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']
    const binPath = path.resolve('./bin/', process.platform, binName)

    if (!fs.existsSync(binPath)) {
      console.warn('Supposedly could not find binPath, continue anyway.')
    }
    return binPath
  }
}

// Exports
module.exports = ImageHandler
