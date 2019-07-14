/**
 *
 * @param {Sharp} image
 * @param {number} val
 */
exports.bri =(image, val) => {
    image.modulate({
        brightness: val
    });
};

/**
 *
 * @param {Sharp} image
 */
exports.sharp = (image) => {
    image.sharpen();
};
