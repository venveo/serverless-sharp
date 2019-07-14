/*********************************************************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

const AWS = require('aws-sdk');
const sharp = require('sharp');

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
            if (edits.fm !== undefined) {
                await modifiedImage.toFormat(edits.fm);
            }
            const bufferImage = await modifiedImage.toBuffer();
            return {
                CacheControl: request.originalImage.CacheControl,
                Body: bufferImage.toString('base64')
            };
        } else {
            return {
                CacheControl: request.originalImage.CacheControl,
                Body: originalImage.toString('base64')
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
        imageOps.apply(image, edits);
        // Accepts 0 - 100


        // const keys = Object.keys(edits);
        // const values = Object.values(edits);

        // Apply formatting edits first
        // Quality
        // if (edits["q"]) {
        // }
        // // Color
        // if (edits["q"]) {
        // }

            // } else if (key === 'focalpoint') {
                // const options = value;
                // const metadata = await image.metadata();
                //
                // const centerX = metadata.width * options.x;
                // const centerY = metadata.height * options.y;
                // let x1 = centerX - metadata.width / 2;
                // let y1 = centerY - metadata.height / 2;
                // let x2 = x1 + metadata.width;
                // let y2 = y1 + metadata.height;
                //
                // if (x1 < 0) {
                //     x2 -= x1;
                //     x1 = 0;
                // }
                // if (y1 < 0) {
                //     y2 -= y1;
                //     y1 = 0;
                // }
                // if (x2 > metadata.width) {
                //     x1 -= (x2 - metadata.width);
                //     x2 = metadata.width;
                // }
                // if (y2 > metadata.height) {
                //     y1 -= (y2 - metadata.height);
                //     y2 = metadata.height;
                // }
                //
                // try {
                //     image.extract({left: x1, top: y1, width: 0, height: 0})
                // } catch (err) {
                //     throw ({
                //         status: 400,
                //     });
                // }
        // }
        // Return the modified image
        return image;
    }
}

// Exports
module.exports = ImageHandler;

