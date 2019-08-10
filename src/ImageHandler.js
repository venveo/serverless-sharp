const AWS = require('aws-sdk');
const sharp = require('sharp');
const fs = require("fs");
const path = require("path");
const {spawnSync} = require('child_process');

const ImageRequest = require('./ImageRequest');

const imageOps = require('./image-ops');

class ImageHandler {

    /**
     * @param {ImageRequest} request
     */
    constructor(request) {
        if (!request instanceof ImageRequest) {
            throw new Error('Expected request of type ImageRequest');
        }
        this.request = request;
    }

    /**
     * Main method for processing image requests and outputting modified images.
     */
    async process() {
        // Get the original image
        const originalImageObject = await this.request.getOriginalImage();
        const originalImageBody = originalImageObject.Body;

        let format;
        let bufferImage;
        // We have some edits to process
        if (Object.keys(this.request.edits).length) {
            const modifiedImage = await this.applyEdits(originalImageBody, this.request.edits);
            // TODO: Finish this
            // const optimizedImage = await this.applyOptimizations(modifiedImage, edits, headers);
            bufferImage = await modifiedImage.toBuffer();
            format = modifiedImage.options.formatOut;
        } else {
            // No edits, just return the original
            bufferImage = new Buffer(originalImageBody, 'binary');
        }
        let contentType;
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
                contentType = originalImageObject.ContentType;
        }
        return {
            CacheControl: originalImageObject.CacheControl,
            Body: bufferImage.toString('base64'),
            ContentType: contentType
        };
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

    /**
     * TODO: Move me out of here
     * @param image
     * @param edits
     * @param headers
     * @returns {Promise<Sharp>}
     */
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
        let quality = parseInt(process.env.DEFAULT_QUALITY);
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
            quality = parseInt(process.env.DEFAULT_COMPRESS_QUALITY);
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

    /**
     * TODO: Move me out of here
     * @param binName
     * @returns {string}
     */
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

