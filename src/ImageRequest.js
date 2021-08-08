const eventParser = require('./helpers/eventParser')
const schemaParser = require('./helpers/schemaParser')
const security = require('./helpers/security')
const sharp = require('sharp')
const HashException = require('./errors/HashException')
const settings = require('./helpers/settings')
const S3Exception = require('./errors/S3Exception')

class ImageRequest {
  constructor (event) {
    this.event = event
    // If the hash isn't set when it should be, we'll throw an error.
    if (settings.getSetting('SECURITY_KEY')) {
      this.checkHash()
    }

    const { bucket, prefix } = eventParser.processSourceBucket(settings.getSetting('SOURCE_BUCKET'))
    this.bucket = bucket
    this.prefix = prefix
    this.key = eventParser.parseImageKey(event.path, prefix)
  }

  /**
   * This method does a number of async things, such as getting the image object and building a schema
   * @return {Promise<void>}
   */
  async process () {
    this.originalImageObject = await this.getOriginalImage()
    this.originalImageBody = this.originalImageObject.Body
    this.originalImageSize = this.originalImageObject.ContentLength

    this.sharpObject = sharp(this.originalImageBody)
    this.originalMetadata = await this.sharpObject.metadata()
    this.headers = this.event.headers

    const queryParams = this.normalizeQueryParams(this.event.queryStringParameters)

    this.schema = schemaParser.getSchemaForQueryParams(queryParams)
    this.edits = schemaParser.normalizeAndValidateSchema(this.schema, queryParams)
  }

  getAutoFormat() {
    const coercibleFormats = ['jpg', 'png', 'webp', 'avif', 'jpeg', 'tiff']
    const autoParam = this.event.multiValueQueryStringParameters.auto
    const specialOutputFormats = eventParser.getAcceptedImageFormatsFromHeaders(this.headers)

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
   * @param {String} bucket - The name of the bucket containing the image.
   * @param {String} key - The key name corresponding to the image.
   * @return {Promise} - The original image or an error.
   */
  async getOriginalImage () {
    const S3 = require('aws-sdk/clients/s3')
    const s3 = new S3()
    const imageLocation = { Bucket: this.bucket, Key: decodeURIComponent(this.key) }
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
   * @param {Object} event - Lambda request body.
   */
  checkHash () {
    const { queryStringParameters, path } = this.event
    if (queryStringParameters && queryStringParameters.s === undefined) {
      throw new HashException()
    }
    if (queryStringParameters) {
      const hash = queryStringParameters.s
      const isValid = security.verifyHash(path, queryStringParameters, hash)
      if (!isValid) {
        throw new HashException()
      }
    }
    return true
  }

  normalizeQueryParams (params = {}) {
    let normalizedParams = schemaParser.replaceAliases(params)

    normalizedParams.fm = this.getAutoFormat() || normalizedParams.fm || this.originalMetadata.format

    return normalizedParams
  }
}

module.exports = ImageRequest
