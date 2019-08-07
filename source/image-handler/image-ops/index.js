const adjustment = require('./adjustment');
const size = require('./size');
const eventParser = require('../helpers/eventParser');
const NotImplementedException = require('../errors/NotImplementedException');

exports.apply = async (image, edits) => {
    // Apply brightness. 1 - 100
    if (edits["bri"]) {
        adjustment.bri(image, Math.round(Number(edits["bri"] / 100)));
    }

    // Sharpen. bool
    if (edits["sharp"]) {
        adjustment.sharp(image)
    }

    const {w, h, fit, crop} = edits;
    if (w || h) {
        switch (fit) {
            case 'clamp':
                throw new NotImplementedException;
            case 'fillmax':
                throw new NotImplementedException;
            case 'max':
                throw new NotImplementedException;
            case 'min':
                throw new NotImplementedException;
            case 'fill':
                await size.fill(image, Number(w), Number(h), edits["fill-color"]);
                break;
            case 'scale':
                size.scale(image, Number(w), Number(h));
                break;
            case 'crop':
                await size.scaleCrop(image, Number(w), Number(h), crop, Number(edits["fp-x"]), Number(edits["fp-y"]));
                break;
            case 'clip':
            default:
                size.scaleClip(image, Number(w), Number(h));
                break;
        }
    }
};
