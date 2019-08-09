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
