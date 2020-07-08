const axios = require('axios')

exports.apply = async (image, edits) => {
  if (edits.blend.processedValue) {
    await this.blend(image, edits.blend.processedValue)
  }
}

/**
 *
 * @param {Sharp} image
 * @param {String} url
 */
exports.blend = async (image, url) => {
  const compositeInput = (await axios({
    url: url,
    responseType: "arraybuffer"
  })).data;

  image.composite([{input: compositeInput, tile: true}])
}
