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
            code: 'scaleClip::InvalidDimensions',
            message: 'Either width AND/OR height must be specified and a positive number'
        });
    }
    image.resize({
        width: width,
        height: height,
        withoutEnlargement: true,
        fit: sharp.fit.inside
    });
};

exports.scaleCrop = (image, width = null, height = null, crop = null) => {
    // top, bottom, left, right, faces, focalpoint, edges, and entropy
    // todo: crop
};
