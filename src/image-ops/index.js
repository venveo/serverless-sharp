import settings from "../helpers/settings";
import size from "./size";
import stylize from "./stylize";

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
export async function apply(image, edits) {
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

export async function restrictSize(image, metadata) {
  const maxImgWidth = settings.getSetting('MAX_IMAGE_WIDTH')
  const maxImgHeight = settings.getSetting('MAX_IMAGE_HEIGHT')
  if ((maxImgWidth && metadata.width > maxImgWidth) || (maxImgHeight && metadata.height > maxImgHeight)) {
    const aspectRatio = parseFloat(metadata.width) / metadata.height
    const width = aspectRatio >= 1 ? maxImgWidth : null
    const height = width === null ? maxImgHeight : null
    await size.scaleMax(image, width, height)
  }
}

export default {
  restrictSize,
  apply
}