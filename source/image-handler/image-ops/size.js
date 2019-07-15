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
 * @param fpx
 * @param fpy
 * @returns {*}
 */
exports.scaleCrop = async (image, width = null, height = null, crop = null, fpx = null, fpy = null) => {
    // top, bottom, left, right, faces, focalpoint, edges, and entropy
    if (!paramValidators.widthOrHeightValid(width, height)) {
        throw ({
            status: 400,
            code: 'size::InvalidDimensions',
            message: 'Either width AND/OR height must be specified and a positive number when using fit-crop'
        });
    }

    // if we don't have a focal point, default to center-center
    if (crop !== 'focalpoint') {
        fpx = 0.5;
        fpy = 0.5;
    }

    // extract metadata from image to compute focal point
    const metadata = await image.metadata();
    let fpx_left = parseInt((metadata.width * fpx) - (0.5 * width));
    let fpy_top = parseInt((metadata.height * fpy) - (0.5 * height));

    // ensure extracted region doesn't exceed image bounds
    if (width > metadata.width) {
        width = metadata.width
    }
    if (height > metadata.height) {
        height = metadata.height
    }

    // adjust focal point x
    if (fpx_left + width > metadata.width) {
        fpx_left = metadata.width - width
    } else if (fpx_left < 0) {
        fpx_left = 0
    }

    // adjust focal point y
    if (fpy_top + height > metadata.height) {
        fpy_top = metadata.height - height
    } else if (fpy_top < 0) {
        fpy_top = 0
    }

    image.extract({
        left: fpx_left,
        top: fpy_top,
        width: width,
        height: height
    });
};
