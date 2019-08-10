exports.apply = (image, edits) => {
    if (edits["bri"] && edits["bri"].value.implicit !== true) {
        this.bri(image, Math.round(Number(edits["bri"] / 100)));
    }
    if (edits["sharp"] && edits["sharp"].value.implicit !== true) {
        this.sharp(image)
    }
};

/**
 *
 * @param {Sharp} image
 * @param {number} val
 */
exports.bri = (image, val) => {
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
