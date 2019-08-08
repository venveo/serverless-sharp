const maxWidth = process.env.MAX_OUTPUT_WIDTH;
const maxHeight = process.env.MAX_OUTPUT_HEIGHT;
const minWidth = 1;
const minHeight = 1;

/**
 * Returns true if the supplied width AND/OR height are valid
 * @param width
 * @param height
 * @returns {boolean}
 */
exports.widthOrHeightValid = (width, height) => {
    // We need a width and/or a height
    if (!width && !height) {
        return false;
    }

    // Handle NaN
    if ((width && isNaN(width)) || (height && isNaN(height))) {
        return false;
    }

    // Handle out-of-bounds width and heights
    if (width && (width > maxWidth || width < minWidth)) {
        return false;
    }
    if (height && (height > maxHeight || height < minHeight)) {
        return false;
    }

    return true;
};

/**
 * Returns true if the supplied width AND height are valid
 * @param width
 * @param height
 * @returns {boolean}
 */
exports.widthAndHeightValid = (width, height) => {
    // We need a width and/or a height
    if (!width || !height) {
        return false;
    }

    // Handle NaN
    if ((width && isNaN(width)) || (height && isNaN(height))) {
        return false;
    }

    // Handle out-of-bounds width and heights
    if (width && (width > maxWidth || width < minWidth)) {
        return false;
    }
    if (height && (height > maxHeight || height < minHeight)) {
        return false;
    }

    return true;
};

/**
 * This function is a comprehensive validation of expected parameters.
 * @param queryStringParams
 * @param throwError
 * @returns {boolean}
 */
exports.validateQueryParams = (queryStringParams, throwError = true) => {
    if (!queryStringParams || !Object.entries(queryStringParams).length) {
        return true;
    }

    const Joi = require('joi');
    const schema = Joi.object().keys({
        q: Joi.number().integer().min(1).max(100),
        bri: Joi.number().integer().min(1).max(100),
        sharp: Joi.number().integer().min(1).max(100),
        fit: Joi.string().valid(['fill', 'scale', 'crop', 'clip']),
        'fill-color': Joi.string(),
        auto: Joi.string().trim().regex(/^(compress,?|format,?|enhance,?|redeye,?|true,?)$/),
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
    }).unknown(true);

    const validation = Joi.validate(queryStringParams, schema);
    if (validation.error) {
        if (throwError) {
            throw {
                status: 500,
                errors: validation.error.details
            }
        } else {
            console.warn('Validation errors:', validation.error.details);
            return false;
        }
    }
    return true;
}
