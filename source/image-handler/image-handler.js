const AWS = require('aws-sdk');
const sharp = require('sharp');
const fs  = require("fs");
const path  = require("path");
const { spawnSync } = require('child_process');

const imageOps = require('./image-ops');

class ImageHandler {

    /**
     * Main method for processing image requests and outputting modified images.
     * @param {ImageRequest} request - An ImageRequest object.
     */
    async process(request) {
        const originalImage = request.originalImage.Body;
        const edits = request.edits;
        if (edits !== undefined) {
            const modifiedImage = await this.applyEdits(originalImage, edits);
            const optimizedImage = await this.applyOptimizations(modifiedImage, edits);
            const bufferImage = await optimizedImage.toBuffer();
            const format = optimizedImage.options.formatOut;
            let contentType;
            // TODO: Break this out
            switch(format) {
                case 'jpeg':
                    contentType = 'image/jpeg';
                    break;
                case 'png':
                    contentType = 'image/png';
                    break;
                case 'webp':
                    contentType = 'image/webp';
                    break;
                case 'gif':
                    contentType = 'image/gif';
                    break;
                case 'svg':
                    contentType = 'image/svg+xml';
                    break;
                default:
                    contentType = 'image';
            }
            return {
                CacheControl: request.originalImage.CacheControl,
                Body: bufferImage.toString('base64'),
                ContentType: contentType
            };
        } else {
            const format = originalImage.options.formatOut;
            let contentType;
            // TODO: Break this out
            switch(format) {
                case 'jpeg':
                    contentType = 'image/jpeg';
                    break;
                case 'png':
                    contentType = 'image/png';
                    break;
                case 'webp':
                    contentType = 'image/webp';
                    break;
                case 'gif':
                    contentType = 'image/gif';
                    break;
                case 'svg':
                    contentType = 'image/svg+xml';
                    break;
                default:
                    contentType = 'image';
            }
            return {
                CacheControl: request.originalImage.CacheControl,
                Body: originalImage.toString('base64'),
                ContentType: contentType
            };
        }
    }

    /**
     * Applies image modifications to the original image based on edits
     * specified in the ImageRequest.
     * @param {Buffer} originalImage - The original image.
     * @param {Object} edits - The edits to be made to the original image.
     */
    async applyEdits(originalImage, edits) {
        const image = sharp(originalImage);
        await imageOps.apply(image, edits);

        return image;
    }

    async applyOptimizations(image, edits) {
        const minColors = 128;  // arbitrary number
        const maxColors = 256*256*256;  // max colors in RGB color space

        let quality = 80;
        if (edits.q !== undefined) {
            quality = parseInt(edits.q);
            if (quality < 0) {
                quality = 0
            } else if (quality > 100) {
                quality = 100
            }
        }

        const metadata = await image.metadata();
        let fm = edits.fm;
        if (fm === undefined) {
            fm = metadata.format
        }

        // adjust quality based on file type
        if (fm === 'jpg' || fm === 'jpeg') {
            await image.jpeg({
                quality: quality,
                trellisQuantisation: true
            })
        } else if (fm === 'png') {
            // ensure that we do not reduce quality if param is not given
            if (quality < 100 && edits.q !== undefined) {
                const buffer = await image.toBuffer();

                // throw(buffer.toString('base64'))
                const minQuality = quality - 20 > 0 ? quality - 20 : 0;

                const pngquant = spawnSync(this.findBin('pngquant'), ['--speed', '3', '--quality', minQuality+'-'+quality, '-'], { input: buffer })
                image = sharp(pngquant.stdout)
            }
        } else if (fm === 'webp') {
            await image.webp({
                quality: quality
            })
        } else {
            await image.toFormat(edits.fm);
        }

        return image
    }

    findBin(binName) {
        const binPath = path.resolve(__dirname, "../bin/", process.platform, binName);

        if ( ! fs.existsSync(binPath) ) {
            throw new Error("Undefined binary: " + binPath);
        }
        return binPath;
    }
}

// Exports
module.exports = ImageHandler;

