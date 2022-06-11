import {getSetting} from "./utils/settings";

import ImageRequest from "./ImageRequest";
import * as imageOps from "./image-ops";
import RequestNotProcessedException from "./errors/RequestNotProcessedException";
import {ImageExtensions, ProcessedImageRequest} from "./types/common";
import {FormatEnum, Metadata, Sharp} from "sharp";
import {getMimeTypeForExtension, normalizeExtension} from "./utils/formats";
import {AutoMode} from "./types/imgix";

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
    const originalImageBody = this.request.inputObjectStream
    if (!originalImageBody || !originalImageObject || !this.request.sharpPipeline) {
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
      const pipeline = this.request.sharpPipeline
      let editsPipeline = pipeline.clone()
      if (this.request.edits && Object.keys(this.request.edits).length) {
        editsPipeline = await this.applyEditsToPipeline(editsPipeline)
      }
      await this.applyOptimizations(editsPipeline)
      bufferImage = await editsPipeline.toBuffer()
      // pipeline.options is not in the Sharp ts definitions. Should probably create a PR
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      format = editsPipeline?.options?.formatOut
    } catch (err) {
      console.error('Unhandlable image encountered', err)
      bufferImage = Buffer.from(originalImageBody.toString(), 'binary')
    }
    if (format !== 'input') {
      contentType = getMimeTypeForExtension(format)
      if (!contentType) {
        throw new RequestNotProcessedException('Output image content type unknown.')
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
   * Applies image modifications to the original image based on edits specified in the ImageRequest. A promise is returned
   * with a Sharp pipeline, which may or may not differ from the input.
   * @param {sharp} editsPipeline the input image pipeline
   */
  async applyEditsToPipeline(editsPipeline: Sharp): Promise<Sharp> {
    imageOps.restrictSize(editsPipeline, <Metadata>this.request.originalMetadata)
    if (!this.request.edits) {
      throw new Error('Edits is not processed')
    }
    return await imageOps.apply(editsPipeline, this.request.edits)
  }

  /**
   * TODO: Move me out of here
   * @param editsPipeline
   */
  applyOptimizations(editsPipeline: Sharp): void {
    // const minColors = 128 // arbitrary number
    // const maxColors = 256 * 256 * 256 // max colors in RGB color space
    let {edits}: ImageRequest = this.request ?? null

    const auto = edits?.auto

    let autoVals = auto?.processedValue
    if (!autoVals || !Array.isArray(autoVals)) {
      autoVals = []
    }

    // Determine our quality - if it was implicitly determined, we'll use the environment setting rather than the schemaForQueryParams
    let quality = <number>getSetting('DEFAULT_QUALITY')
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
    // Ensure edits is an object before we start processing.
    edits = edits ?? {}

    let fm = edits?.fm?.processedValue ?? this.request.getAutoFormat();
    if (!fm) {
      throw new RequestNotProcessedException('Unable to determine output format for image')
    }
    fm = normalizeExtension(<string>fm)

    if (autoVals.includes(AutoMode.COMPRESS)) {
      quality = <number>getSetting('DEFAULT_COMPRESS_QUALITY')
    }


    // adjust quality based on file type
    if (fm === ImageExtensions.JPG || fm === ImageExtensions.JPEG) {
      if (autoVals.includes(AutoMode.COMPRESS) && quality < 100 && edits.q !== undefined) {
        editsPipeline.jpeg({
          quality: quality,
          mozjpeg: true
        })
      } else {
        editsPipeline.jpeg({
          quality: quality,
          trellisQuantisation: true
        })
      }
    } else if (fm === ImageExtensions.PNG) {
      editsPipeline.png({
        quality: quality,
        palette: true
      })
    } else if (fm === ImageExtensions.WEBP) {
      const options = {
        quality: quality,
        lossless: false
      }
      if ('lossless' in edits && edits.lossless.processedValue === true) {
        options.lossless = true
      }
      editsPipeline.webp(options)
    } else if (fm === ImageExtensions.AVIF) {
      const options = {
        quality: quality,
        lossless: false
      }
      if ('lossless' in edits && edits.lossless.processedValue === true) {
        options.lossless = true
      }
      editsPipeline.avif(options)
    } else if (fm !== null) {
      editsPipeline.toFormat(fm as keyof FormatEnum)
    } else {
      throw new RequestNotProcessedException('Unable to determine output format for image')
    }
  }
}

