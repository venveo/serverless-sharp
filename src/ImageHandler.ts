import {getSetting} from "./utils/settings";

import ImageRequest from "./ImageRequest";
import * as imageOps from "./image-ops";
import {ImageExtension, ParsedEdits, ProcessedImageRequest} from "./types/common";
import {AvifOptions, FormatEnum, Metadata, PngOptions, Sharp, WebpOptions} from "sharp";
import {getMimeTypeForExtension} from "./utils/formats";
import {AutoMode} from "./types/imgix";
import createHttpError from "http-errors";

export default class ImageHandler {
  private readonly request: ImageRequest;

  constructor(request: ImageRequest) {
    if (!request.originalImageObject) {
      throw createHttpError(404, 'Image not found or request not fully processed!', {
        expose: false
      })
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
      throw createHttpError(500, 'Original image body or image object not available prior to processing.')
    }

    let contentType = originalImageObject.ContentType ?? null
    if (!contentType) {
      throw createHttpError(500, 'Original image content type unknown.', {expose: true})
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

    // Sharp considers the output format for avif to be heic, which won't display properly in the browser.
    if (this.request?.edits?.fm.processedValue === 'avif') {
      format = 'avif'
    }

    if (format !== 'input') {
      contentType = getMimeTypeForExtension(format)
      if (!contentType) {
        throw new createHttpError.InternalServerError('Original image content type unknown.')
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
   * Applies image modifications to the original image based on edits specified in the ImageRequest. A promise is
   * returned with a Sharp pipeline, which may or may not differ from the input.
   * @param editsPipeline - the input image pipeline
   */
  async applyEditsToPipeline(editsPipeline: Sharp): Promise<Sharp> {
    imageOps.restrictSize(editsPipeline, <Metadata>this.request.originalMetadata)
    if (!this.request.edits) {
      throw new createHttpError.InternalServerError('Edits is not processed')
    }
    return await imageOps.apply(editsPipeline, this.request.edits)
  }

  /**
   * TODO: Move me out of here
   */
  applyOptimizations(editsPipeline: Sharp): void {
    const edits = <ParsedEdits>this.request?.edits ?? {}
    const autoVals = edits.auto.processedValue ?? []

    // Determine our quality - if it was implicitly determined, we'll use the environment setting rather than the
    // schemaForQueryParams
    let quality = <number>getSetting('DEFAULT_QUALITY')
    if (!edits.q.implicit) {
      quality = edits.q.processedValue
      if (quality < 1) {
        quality = 1
      } else if (quality > 100) {
        quality = 100
      }
    }

    const fm = edits.fm.processedValue
    if (!fm) {
      throw new createHttpError.InternalServerError('Unable to determine output format for image')
    }

    if (autoVals.includes(AutoMode.COMPRESS)) {
      quality = <number>getSetting('DEFAULT_COMPRESS_QUALITY')
    }


    // adjust quality based on file type
    // NOTE: JPEG is coerced to JPG early in the program lifecycle
    if (fm === ImageExtension.JPG) {
      if (autoVals.includes(AutoMode.COMPRESS) && quality < 100) {
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
    } else if (fm === ImageExtension.PNG) {
      const options: PngOptions = {
        quality: quality,
        palette: true
      }
      editsPipeline.png(options)
    } else if (fm === ImageExtension.WEBP) {
      const options: WebpOptions = {
        quality: quality,
        lossless: false
      }
      if (edits.lossless.processedValue) {
        options.lossless = true
      }
      editsPipeline.webp(options)
    } else if (fm === ImageExtension.AVIF) {
      const options: AvifOptions = {
        quality: quality,
        lossless: false,
        effort: 4,
        chromaSubsampling: '4:2:0'
      }
      if (edits.lossless.processedValue) {
        options.lossless = true
      }

      editsPipeline.avif(options)
    } else if (fm !== null) {
      editsPipeline.toFormat(<keyof FormatEnum>fm)
    } else {
      throw new createHttpError.InternalServerError('Unable to determine output format for image')
    }
  }
}

