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

    let qp = this._parseQueryParams()
    qp = await this._inferOutputFormatQp(qp)

    this.schema = schemaParser.getSchemaForQueryParams(qp)
    this.edits = schemaParser.normalizeAndValidateSchema(this.schema, qp)
    this.headers = this.event.headers
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

  /**
   * Decodes the image request path associated with default
   * image requests. Provides error handling for invalid or undefined path values.
   * @param {Object} event - The proxied request object.
   */
  _parseQueryParams () {
    let qp = this.event.queryStringParameters
    if (!qp) {
      qp = {}
    }
    return schemaParser.replaceAliases(qp)
  }

  /**
   * We need to set an output format if one isn't provided. This is necessary to ensure our dependencies are correctly
   * computed.
   * @param qp
   * @return {*}
   * @private
   */
  async _inferOutputFormatQp (qp) {
    // One is already defined, let's roll with it. Also, use jpg not jpeg (cuz imgix)
    if (qp.fm !== undefined) {
      if (qp.fm === 'jpeg') {
        qp.fm = 'jpg'
      } else {
        qp.fm = qp.fm.toLowerCase()
      }
      return qp
    }
    const image = sharp(this.originalImageBody)
    const metadata = await image.metadata()
    qp.fm = metadata.format.toLowerCase() === 'jpeg' ? 'jpg' : metadata.format.toLowerCase()
    return qp
  }
}

module.exports = ImageRequest
