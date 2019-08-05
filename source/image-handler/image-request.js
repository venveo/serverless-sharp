const Joi = require('joi');

const eventParser = require('./helpers/eventParser');
const security = require('./helpers/security');

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

            // This is disabled for now. We don't want to throw errors
            // this.validateQueryParams(event);

            const {bucket, prefix} = eventParser.processSourceBucket(process.env.SOURCE_BUCKET);
            this.bucket = bucket;

            this.key = eventParser.parseImageKey(event['path'], prefix);
            this.edits = ImageRequest.decodeRequest(event);
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

    validateQueryParams(request) {
        const schema = Joi.object().keys({
            q: Joi.number().integer().min(1).max(100),
            bri: Joi.number().integer().min(1).max(100),
            sharp: Joi.boolean(),
            fit: Joi.string().valid(['fill', 'scale', 'crop', 'clip']),
            'fill-color': Joi.string(),
            auto: Joi.string().trim().regex(/^(compress,?|format){1,2}$/),
            crop: Joi.string().trim().regex(/^focalpoint|(center,?|top,?|left,?|right,?|bottom,?){1,2}$/),
            'fp-x': Joi.number().min(0).max(1).when('crop', {
                is: 'focalpoint',
                then: Joi.number().required()
            }),
            'fp-y': Joi.number().min(0).max(1).when('crop', {
                is: 'focalpoint',
                then: Joi.number().required()
            }),
            fm: Joi.string().valid(['png', 'jpeg', 'webp', 'tiff']),
            w: Joi.number().integer().min(1),
            h: Joi.number().integer().min(1),
            s: Joi.string().length(32),
        });

        const {queryStringParameters} = request;
        if (!queryStringParameters) {
            return;
        }
        const validation = Joi.validate(queryStringParameters, schema);
        if (validation.error) {
            throw {
                status: 500,
                errors: validation.error.details
            }
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
        return qp;
    }
}

// Exports
module.exports = ImageRequest;
