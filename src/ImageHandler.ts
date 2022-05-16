import {getSetting} from "./utils/settings";

import ImageRequest from "./ImageRequest";
import * as imageOps from "./image-ops";
import RequestNotProcessedException from "./errors/RequestNotProcessedException";
import {ImageExtensions, ParsedSchemaItem, ProcessedImageRequest} from "./types/common";
import {FormatEnum, Sharp} from "sharp";

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
  async process(): Promise<ProcessedImageRequest> {
    // Get the original image
    const originalImageObject = this.request.originalImageObject
    const originalImageBody = this.request.originalImageBody
    if (!originalImageBody || !originalImageObject || !this.request.sharpObject) {
      throw new RequestNotProcessedException('Original image body or image object not available prior to processing.')
    }

    let contentType = originalImageObject.ContentType ?? null
    if (!contentType) {
      throw new RequestNotProcessedException('Original image content type unknown.')
    }
    // TODO: Add typechecking here
    let format = 'input'
    let bufferImage

    // We have some edits to process
    try {
      // We're calling rotate on this immediately in order to ensure metadata for rotation doesn't get lost
      const pipeline = this.request.sharpObject.rotate()
      if (this.request.edits && Object.keys(this.request.edits).length) {
        await this.applyEdits(pipeline, this.request.edits)
      }
      await this.applyOptimizations(pipeline)
      bufferImage = await pipeline.toBuffer()
      // pipeline.options is not in the Sharp ts definitions. Should probably create a PR
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      format = pipeline.options.formatOut
    } catch (err) {
      console.error('Unhandlable image encountered', err)
      bufferImage = Buffer.from(originalImageBody.toString(), 'binary')
    }
    if (format) {
      switch (format.toLowerCase()) {
      case ImageExtensions.JPEG:
      case ImageExtensions.JPG:
        contentType = 'image/jpeg'
        break
      case ImageExtensions.PNG:
        contentType = 'image/png'
        break
      case ImageExtensions.WEBP:
        contentType = 'image/webp'
        break
      case ImageExtensions.GIF:
        contentType = 'image/gif'
        break
      case ImageExtensions.HEIF:
        contentType = 'image/avif'
        break
      case 'input':
        break
      default:
        console.warn('Unexpected output content type encountered: ' + contentType)
      }
    }

    return {
      CacheControl: originalImageObject.CacheControl ?? null,
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
  async applyEdits(image: Sharp, edits: { [operation: string]: ParsedSchemaItem }) {
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
  async applyOptimizations(image: Sharp) {
    // const minColors = 128 // arbitrary number
    // const maxColors = 256 * 256 * 256 // max colors in RGB color space
    const {edits}: ImageRequest = this.request
    if (!edits) {
      // TODO: Is this safe?
      return
    }

    const auto = edits.auto

    let autoVals = auto.processedValue
    if (!Array.isArray(autoVals)) {
      autoVals = []
    }

    // Determine our quality - if it was implicitly determined, we'll use the environment setting rather than the schema
    let quality = getSetting('DEFAULT_QUALITY')
    if (edits) {
      if (!edits.q.implicit) {
        quality = parseInt(edits.q.processedValue as string)
        if (quality < 1) {
          quality = 1
        } else if (quality > 100) {
          quality = 100
        }
      }
    }

    const fm = edits.fm.processedValue

    if (autoVals.includes('compress')) {
      quality = getSetting('DEFAULT_COMPRESS_QUALITY')
    }


    // adjust quality based on file type
    if (fm === ImageExtensions.JPG || fm === ImageExtensions.JPEG) {
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
        quality: quality,
        lossless: false
      }
      if ('lossless' in edits && edits.lossless.processedValue === true) {
        options.lossless = true
      }
      image.webp(options)
    } else if (fm === 'avif') {
      const options = {
        quality: quality,
        lossless: false
      }
      if ('lossless' in edits && edits.lossless.processedValue === true) {
        options.lossless = true
      }
      image.avif(options)
    } else if (fm !== undefined) {
      image.toFormat(fm as keyof FormatEnum)
    }

    return image
  }
}

