const eventParser = require('./helpers/eventParser');
const schemaParser = require('./helpers/schemaParser');
const security = require('./helpers/security');

class ImageRequest {
    constructor(event) {
        // If the hash isn't set when it should be, we'll throw an error.
        if (process.env.SECURITY_KEY !== undefined && process.env.SECURITY_KEY !== null && process.env.SECURITY_KEY.length) {
            ImageRequest.checkHash(event);
        }

        const {bucket, prefix} = eventParser.processSourceBucket(process.env.SOURCE_BUCKET);
        this.bucket = bucket;

        this.key = eventParser.parseImageKey(event['path'], prefix);

        const qp = ImageRequest._parseQueryParams(event);
        this.schema = schemaParser.getSchemaForQueryParams(qp);
        this.edits = schemaParser.normalizeAndValidateSchema(this.schema, qp);
        this.headers = event['headers'];
    }

    /**
     * Gets the original image from an Amazon S3 bucket.
     * @param {String} bucket - The name of the bucket containing the image.
     * @param {String} key - The key name corresponding to the image.
     * @return {Promise} - The original image or an error.
     */
    async getOriginalImage() {
        const S3 = require('aws-sdk/clients/s3');
        const s3 = new S3();
        const imageLocation = {Bucket: this.bucket, Key: decodeURIComponent(this.key)};
        const request = s3.getObject(imageLocation).promise();
        try {
            const originalImage = await request;
            return Promise.resolve(originalImage);
        } catch (err) {
            return Promise.reject({
                status: 404,
                code: err.code,
                message: err.message
            })
        }
    }

    /**
     * Parses the name of the appropriate Amazon S3 key corresponding to the
     * original image.
     * @param {Object} event - Lambda request body.
     */
    static checkHash(event) {
        const {queryStringParameters, path} = event;
        if (!queryStringParameters || queryStringParameters['s'] === undefined) {
            throw {
                status: 400,
                code: 'RequestTypeError',
                message: 'Security hash not present'
            };
        }
        const hash = queryStringParameters['s'];
        const isValid = security.verifyHash(path, queryStringParameters, hash);
        if (!isValid) {
            throw {
                status: 403,
                code: 'RequestTypeError',
                message: 'Invalid security hash'
            };
        }
    }

    /**
     * Decodes the image request path associated with default
     * image requests. Provides error handling for invalid or undefined path values.
     * @param {Object} event - The proxied request object.
     */
    static _parseQueryParams(event) {
        let qp = event["queryStringParameters"];
        if (!qp) {
            qp = {};
        }
        return schemaParser.replaceAliases(qp);
    }
}

module.exports = ImageRequest;
