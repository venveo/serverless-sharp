const adjustment = require('./adjustment');
const size = require('./size');

exports.apply = (image, edits) => {

    // Apply brightness. 0 - 100
    if (edits["bri"]) {
        adjustment.bri(image, Math.round(Number(edits["bri"] / 100)));
    }

    // Sharpen. bool
    if (edits["sharp"]) {
        adjustment.sharp(image)
    }

    const {w, h, fit, crop} = edits;
    if (w || h) {
        switch(fit) {
            case 'clamp':
                break;
            case 'fill':
                break;
            case 'fillmax':
                break;
            case 'max':
                break;
            case 'min':
                break;
            case 'scale':
                size.scale(image, Number(w), Number(h));
                break;
            case 'crop':
                size.scaleCrop(image, Number(w), Number(h), crop);
                break;
            case 'clip':
            default:
                size.scaleClip(image, Number(w), Number(h));
                break;
        }
    }
};
