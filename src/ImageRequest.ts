import sharp from 'sharp'

import {getAcceptedImageFormatsFromHeaders, parseImageKey, processSourceBucket} from "./helpers/eventParser";
import {getSchemaForQueryParams, normalizeAndValidateSchema, replaceAliases} from "./helpers/schemaParser";
import {verifyHash} from "./helpers/security";
import {getSetting} from "./helpers/settings";
import HashException from "./errors/HashException";
import S3Exception from "./errors/S3Exception";

export default class ImageRequest {
  bucket: string | null
  prefix: string | null

  key: string
  event: object

  originalImageObject: any;
  originalImageBody: any;
  originalImageSize: any;

  sharpObject: sharp.Sharp | null = null;
  originalMetadata: sharp.Metadata | null = null;
  schema: {} | null = null;
  edits: {} | null = null;
  headers: any = null;

  constructor(event: any) {
    this.event = event
    // If the hash isn't set when it should be, we'll throw an error.
    if (getSetting('SECURITY_KEY')) {
      this.checkHash()
    }

    const {bucket, prefix} = processSourceBucket(getSetting('SOURCE_BUCKET'))
    this.bucket = bucket
    this.prefix = prefix
    // Handle API Gateway event and Lambda URL event
    const path = event.path ?? event.rawPath ?? null
    this.key = parseImageKey(path, prefix)
  }

  /**
   * This method does a number of async things, such as getting the image object and building a schema
   * @return {Promise<void>}
   */
  async process() {
    this.originalImageObject = await this.getOriginalImage()
    this.originalImageBody = this.originalImageObject.Body
    this.originalImageSize = this.originalImageObject.ContentLength

    this.sharpObject = sharp(this.originalImageBody)
    this.originalMetadata = await this.sharpObject.metadata()
    this.headers = this.event.headers

    const queryParams = this.normalizeQueryParams(this.event.queryStringParameters)

    this.schema = getSchemaForQueryParams(queryParams)
    this.edits = normalizeAndValidateSchema(this.schema, queryParams)
  }

  getAutoFormat() {
    const coercibleFormats = ['jpg', 'png', 'webp', 'avif', 'jpeg', 'tiff']
    let autoParam = null
    if (this.event.multiValueQueryStringParameters && this.event.multiValueQueryStringParameters.auto) {
      autoParam = this.event.multiValueQueryStringParameters.auto
    }
    const specialOutputFormats = getAcceptedImageFormatsFromHeaders(this.headers)

    if (
      !autoParam ||
      !autoParam.includes('format') ||
      !coercibleFormats.includes(this.originalMetadata.format)
    ) {
      return null
    }

    if (specialOutputFormats.includes('avif')) {
      return 'avif'
    }
    // If avif isn't available, try to use webp
    else if (specialOutputFormats.includes('webp')) {
      return 'webp'
    }
    // Coerce pngs and tiffs without alpha channels to jpg
    else if (!this.originalMetadata.hasAlpha && (['png', 'tiff'].includes(this.originalMetadata.format))) {
      return 'jpeg'
    }

    return null
  }

  /**
   * Gets the original image from an Amazon S3 bucket.
   */
  async getOriginalImage() {
    const S3 = require('aws-sdk/clients/s3')
    const s3 = new S3()
    const imageLocation = {Bucket: this.bucket, Key: decodeURIComponent(this.key)}
    const request = s3.getObject(imageLocation).promise()
    try {
      const originalImage = await request
      return Promise.resolve(originalImage)
    } catch (err) {
      const error = new S3Exception(err.statusCode, err.code, err.message)
      return Promise.reject(error)
    }
  }

  /**
   * Parses the name of the appropriate Amazon S3 key corresponding to the
   * original image.
   */
  checkHash() {
    const {queryStringParameters, path} = this.event
    if (queryStringParameters && queryStringParameters.s === undefined) {
      throw new HashException()
    }
    if (queryStringParameters) {
      const hash = queryStringParameters.s
      const isValid = verifyHash(path, queryStringParameters, hash)
      if (!isValid) {
        throw new HashException()
      }
    }
    return true
  }

  normalizeQueryParams(params = {}) {
    if (!params) {
      params = {}
    }
    let normalizedParams = replaceAliases(params)

    normalizedParams.fm = this.getAutoFormat() || normalizedParams.fm || this.originalMetadata.format

    return normalizedParams
  }
}
