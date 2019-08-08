const eventParser = require('./helpers/eventParser');
const schemaParser = require('./helpers/schemaParser');
const security = require('./helpers/security');
const paramValidators = require('./helpers/paramValidators');

class ImageRequest {
    /**
     * Initializer function for creating a new image request, used by the image
     * handler to perform image modifications.
     * @param {Object} event - Lambda request body.
     */
    async setup(event) {
        try {
            if (process.env.SECURITY_KEY !== undefined && process.env.SECURITY_KEY !== null && process.env.SECURITY_KEY.length) {
                this.parseHash(event);
            }

            const {queryStringParameters} = event;

            // For now, we're going to soft-validate
            const hadErrors = paramValidators.validateQueryParams(queryStringParameters, false);

            const {bucket, prefix} = eventParser.processSourceBucket(process.env.SOURCE_BUCKET);

            this.bucket = bucket;
            this.key = eventParser.parseImageKey(event['path'], prefix);
            this.edits = {};

            // Go ahead and allow the original image to pass-through
            if (hadErrors) {
                this.edits = ImageRequest.decodeRequest(event);
            }
            this.headers = event.headers;

            this.originalImage = await this.getOriginalImage(this.bucket, this.key);
            return Promise.resolve(this);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Gets the original image from an Amazon S3 bucket.
     * @param {String} bucket - The name of the bucket containing the image.
     * @param {String} key - The key name corresponding to the image.
     * @return {Promise} - The original image or an error.
     */
    async getOriginalImage(bucket, key) {
        const S3 = require('aws-sdk/clients/s3');
        const s3 = new S3();
        const imageLocation = {Bucket: bucket, Key: decodeURIComponent(key)};
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
     * Parses the edits to be made to the original image.
     * @param {String} event - Lambda request body.
     */
    static parseImageEdits(event) {
        const decoded = ImageRequest.decodeRequest(event);
        return decoded.edits;
    }

    /**
     * Parses the name of the appropriate Amazon S3 key corresponding to the
     * original image.
     * @param {Object} event - Lambda request body.
     */
    parseHash(event) {
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
    static decodeRequest(event) {
        let qp = event["queryStringParameters"];
        if (!qp) {
            qp = {};
        }
        return schemaParser.replaceAliases(qp);
    }
}

// Exports
module.exports = ImageRequest;
