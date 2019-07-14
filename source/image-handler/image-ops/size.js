const sharp = require('sharp');

/**
 *
 * @param {Sharp} image
 * @param width
 * @param height
 * @returns {*}
 */
exports.scaleClip = (image, width = null, height = null) => {
    if (!width && !height) {
        throw ({
            status: 400,
            code: 'size.scaleClip::InvalidDimensions',
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
    if (!width && !height) {
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
 * Stretch an image to fit the
 * @param {Sharp} image
 * @param width
 * @param height
 * @returns {*}
 */
exports.scale = (image, width, height) => {
    if (!width || !height) {
        throw ({
            status: 400,
            code: 'size.scale::InvalidDimensions',
            message: 'Either width AND height must be specified and a positive number when using fit-scale'
        });
    }
    image.resize({
        width: width,
        height: height,
        fit: sharp.fit.fill
    });
};

exports.scaleCrop = (image, width = null, height = null, crop = null) => {
    // top, bottom, left, right, faces, focalpoint, edges, and entropy
    if (!width && !height) {
        throw ({
            status: 400,
            code: 'size.scaleCrop::InvalidDimensions',
            message: 'Either width AND/OR height must be specified and a positive number when using fit-crop'
        });
    }
    // todo: crop
};
