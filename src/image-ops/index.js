const size = require('./size')
const stylize = require('./stylize')

const operationsByCategory = {
  size: size.apply,
  stylize: stylize.apply
  // adjustment: adjustment.apply
}

/**
 * Applies all supported image operations to the supplied image
 * @param image
 * @param edits
 * @return {Promise<void>}
 */
exports.apply = async (image, edits) => {
  const editsByCategory = {}
  for (const edit in edits) {
    if (editsByCategory[edits[edit].schema.category] === undefined) {
      editsByCategory[edits[edit].schema.category] = {}
    }
    editsByCategory[edits[edit].schema.category][edit] = edits[edit]
  }

  for (const category in editsByCategory) {
    if (editsByCategory[category] !== undefined && operationsByCategory[category] !== undefined) {
      await operationsByCategory[category](image, edits)
    }
  }
}

exports.restrictSize = async (image, metadata) => {
  const maxImgWidth = process.env.MAX_IMAGE_WIDTH !== null ? parseInt(process.env.MAX_IMAGE_WIDTH) : null;
  const maxImgHeight = process.env.MAX_IMAGE_HEIGHT !== null ? parseInt(process.env.MAX_IMAGE_HEIGHT) : null;
  if ((maxImgWidth && metadata.width > maxImgWidth) || (maxImgHeight && metadata.height > maxImgHeight)) {
    const aspectRatio = parseFloat(metadata.width) / metadata.height
    const width = aspectRatio >= 1 ? maxImgWidth : null,
        height = width === null ? maxImgHeight : null
    await size.scaleMax(image, width, height)
  }
}
