const AWS = require('aws-sdk');
const sharp = require('sharp');
const fs = require("fs");
const path = require("path");
const {spawnSync} = require('child_process');

const imageOps = require('./image-ops');

class ImageHandler {

    /**
     * Main method for processing image requests and outputting modified images.
     * @param {ImageRequest} request - An ImageRequest object.
     */
    async process(request) {
        const originalImage = request.originalImage.Body;
        const {edits, headers} = request;
        if (edits !== undefined) {
            const modifiedImage = await this.applyEdits(originalImage, edits);
            const optimizedImage = await this.applyOptimizations(modifiedImage, edits, headers);
            const bufferImage = await optimizedImage.toBuffer();
            const format = optimizedImage.options.formatOut;
            let contentType;
            // TODO: Break this out
            switch (format) {
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
            switch (format) {
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

    async applyOptimizations(image, edits, headers) {
        const minColors = 128;  // arbitrary number
        const maxColors = 256 * 256 * 256;  // max colors in RGB color space

        const {auto} = edits;

        let autoOps = [];

        // Get our ops from auto
        if (auto) {
            autoOps = auto.split(',');
        }

        // Determine our quality
        let quality = 80;
        if (edits.q !== undefined) {
            quality = parseInt(edits.q);
            if (quality < 1) {
                quality = 1
            } else if (quality > 100) {
                quality = 100
            }
        }

        // Get the image meta-data and the initial format
        const metadata = await image.metadata();
        let fm = edits.fm;
        if (fm === undefined) {
            fm = metadata.format
        }

        if (autoOps.includes('compress')) {
            if (!metadata.hasAlpha && (fm === 'png' || fm === 'tiff')) {
                fm = 'jpeg'
            } else if (metadata.hasAlpha && fm === 'png') {
                fm = 'png'
            }
        }

        if (autoOps.includes('format')) {
            // If the browser supports webp, use webp for everything but gifs
            if (headers && 'Accept' in headers) {
                if (fm !== 'gif' && headers['Accept'].indexOf('image/webp') !== -1) {
                    fm = 'webp';
                }
            }
        }

        // adjust quality based on file type
        if (fm === 'jpg' || fm === 'jpeg') {
            await image.jpeg({
                quality: quality,
                trellisQuantisation: true
            })
        } else if (fm === 'png') {
            // ensure that we do not reduce quality if param is not given
            if (autoOps.includes('compress') && quality < 100 && edits.q !== undefined) {
                const buffer = await image.toBuffer();
                const minQuality = quality - 20 > 0 ? quality - 20 : 0;
                const pngQuantOptions = ['--speed', '3', '--quality', minQuality + '-' + quality, '-'];
                const binaryLocation = this.findBin('pngquant');
                if (binaryLocation) {
                    const pngquant = spawnSync(binaryLocation, pngQuantOptions, {input: buffer});
                    image = sharp(pngquant.stdout)
                } else {
                    console.warn('Skipping pngquant - could not find executable!');
                    await image.png({
                        quality: quality
                    });
                }
            } else {
                await image.png({
                    quality: quality
                });
            }
        } else if (fm === 'webp') {
            let options = {
                quality: quality
            };
            if ('lossless' in edits && edits.lossless === 'true') {
                options.lossless = true;
            }
            await image.webp(options)
        } else {
            await image.toFormat(edits.fm);
        }

        return image
    }

    findBin(binName) {
        process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];
        const binPath = path.resolve("./bin/", process.platform, binName);

        if (!fs.existsSync(binPath)) {
            console.warn('Supposedly could not find binPath, continue anyway.');
        }
        return binPath;

    }
}

// Exports
module.exports = ImageHandler;

