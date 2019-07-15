const sharp = require('sharp');
const paramValidators = require('../helpers/paramValidators');

/**
 *
 * @param {Sharp} image
 * @param width
 * @param height
 * @returns {*}
 */
exports.scaleClip = (image, width = null, height = null) => {

    if (!paramValidators.widthOrHeightValid(width, height)) {
        throw ({
            status: 400,
            code: 'size::InvalidDimensions',
            message: 'Either width AND/OR height must be specified and a positive number when using scale-clip'
        });
    }
    image.resize({
        width: width,
        height: height,
        withoutEnlargement: true,
        fit: sharp.fit.inside
    });
};


/**
 *
 * @param {Sharp} image
 * @param width
 * @param height
 * @param color
 * @returns {*}
 */
exports.fill = async (image, width = null, height = null, color = null) => {
    if (!paramValidators.widthOrHeightValid(width, height)) {
        throw ({
            status: 400,
            code: 'size.fill::InvalidDimensions',
            message: 'Either width AND/OR height must be specified and a positive number when using scale-clip'
        });
    }
    let resizeParams = {
        withoutEnlargement: false,
        fit: sharp.fit.contain
    };
    if (width) {
        resizeParams.width = width;
    }
    if (height) {
        resizeParams.height = height;
    }
    // TODO: Validate color more explicitly
    if (color) {
        resizeParams.background = color;
    }
    image.resize(resizeParams);
};

/**
 * Stretch an image to fit the dimensions requested
 * @param {Sharp} image
 * @param width
 * @param height
 * @returns {*}
 */
exports.scale = (image, width, height) => {
    if (!paramValidators.widthAndHeightValid(width, height)) {
        throw ({
            status: 400,
            code: 'size::InvalidDimensions',
            message: 'Width AND height must be specified and a positive number when using fit-scale'
        });
    }
    image.resize({
        width: width,
        height: height,
        withoutEnlargement: true,
        fit: sharp.fit.fill
    });
};

/**
 * Handle cropping modes
 * @param {Sharp} image
 * @param width
 * @param height
 * @param crop
 * @returns {*}
 */
exports.scaleCrop = (image, width = null, height = null, crop = null) => {
    // top, bottom, left, right, faces, focalpoint, edges, and entropy
    if (!paramValidators.widthOrHeightValid(width, height)) {
        throw ({
            status: 400,
            code: 'size::InvalidDimensions',
            message: 'Either width AND/OR height must be specified and a positive number when using fit-crop'
        });
    }
    // todo: crop
};
