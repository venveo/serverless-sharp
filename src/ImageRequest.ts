import sharp from 'sharp'

import {getAcceptedImageFormatsFromHeaders, extractObjectKeyFromUri, extractBucketNameAndPrefix} from "./utils/httpRequestProcessor";
import {getSchemaForQueryParams, normalizeAndValidateSchema, replaceAliases} from "./utils/schemaParser";
import {verifyHash} from "./utils/security";
import {getSetting} from "./utils/settings";
import HashException from "./errors/HashException";
// import S3Exception from "./errors/S3Exception";
import {BucketDetails, RequestHeaders} from "./types/common";

import S3 from "aws-sdk/clients/s3";

export default class ImageRequest {
  bucketDetails: BucketDetails

  key: string
  event: any

  originalImageObject: any;
  originalImageBody: any;
  originalImageSize: any;

  sharpObject: sharp.Sharp | null = null;
  originalMetadata: sharp.Metadata | null = null;
  schema: Record<string, unknown> | null = null;
  edits: Record<string, unknown> | null = null;
  headers: RequestHeaders | null = null;

  constructor(event: any) {
    this.event = event
    // If the hash isn't set when it should be, we'll throw an error.
    if (getSetting('SECURITY_KEY')) {
      this.checkHash()
    }

    this.bucketDetails = extractBucketNameAndPrefix(getSetting('SOURCE_BUCKET'))

    // Handle API Gateway event and Lambda URL event
    const path = event.path ?? event.rawPath ?? null
    this.key = extractObjectKeyFromUri(path, this.bucketDetails.prefix)
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
    if (!this.headers || !this.originalMetadata || this.originalMetadata.format === undefined) {
      return null;
    }
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
    const s3 = new S3()
    const imageLocation = {Bucket: this.bucketDetails.name, Key: decodeURIComponent(this.key)}
    const request = s3.getObject(imageLocation).promise()
    try {
      const originalImage = await request
      return Promise.resolve(originalImage)
    } catch (err) {
      // const error = new S3Exception(err.statusCode, err.code, err.message)
      // return Promise.reject(error)
      // TODO: Add S3 error back here once you figure out the type
      return Promise.reject()
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
    const normalizedParams = replaceAliases(params)
    normalizedParams.fm = this.getAutoFormat() ?? normalizedParams.fm ?? this.originalMetadata?.format ?? null

    return normalizedParams
  }
}
