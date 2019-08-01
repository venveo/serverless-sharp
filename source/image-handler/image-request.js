const crypto = require('crypto');
const Joi = require('@hapi/joi');

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
            this.validateQueryParams(event);

            this.bucket = process.env.SOURCE_BUCKET;
            this.key = this.parseImageKey(event);
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
    parseImageKey(event) {
        // Decode the image request and return the image key
        // Ensure the path starts with our prefix
        let key = decodeURI(event["path"]);
        if(process.env.OBJECT_PREFIX !== undefined && process.env.OBJECT_PREFIX !== null && process.env.OBJECT_PREFIX.length) {
            if (!key.startsWith('/' + process.env.OBJECT_PREFIX)) {
                key = '/' + process.env.OBJECT_PREFIX + key;
            }
        }
        if(key.startsWith('/')) {
            key = key.substr(1);
        }
        return key;
    }

    /**
     * Assembles an object of query params into a string for hashing
     * @param queryStringParameters
     * @returns {string}
     * @private
     */
    static _buildQueryStringFromObject(queryStringParameters) {
        let string = '';
        for (const [k, v] of Object.entries(queryStringParameters)) {
            // Don't hash the security token
            if (k !== 's') {
                string += '&' + k + '=' + encodeURIComponent(v);
            }
        }
        return '?' + string.substr(1);
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
        const query = ImageRequest._buildQueryStringFromObject(queryStringParameters);
        const encodedPath = decodeURIComponent(path).split('/').map((comp) => {
            return encodeURIComponent(comp)
        }).join('/');
        const source = process.env.SECURITY_KEY + encodedPath + query;
        const parsed = crypto.createHash('md5').update(source).digest("hex");
        if (parsed !== hash) {
            throw {
                status: 403,
                code: 'RequestTypeError',
                message: 'Invalid security hash'
            };
        }
        return parsed;
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
        var validation = Joi.validate(queryStringParameters, schema);
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
