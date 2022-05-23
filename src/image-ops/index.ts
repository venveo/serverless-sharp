import {getSetting} from "../utils/settings";
import * as size from "./size";
import * as stylize from "./stylize";
import sharp from "sharp";
import {ParsedEdits} from "../types/common";

const operationsByCategory = {
  size: size.apply,
  stylize: stylize.apply
  // adjustment: adjustment.apply
}

/**
 * Applies all supported image operations to the supplied image
 * @param editsPipeline
 * @param edits
 * @return {Promise<void>}
 */
export async function apply(editsPipeline: sharp.Sharp, edits: ParsedEdits) {
  const editsByCategory = {}
  for (const edit in edits) {
    if (editsByCategory[edits[edit].schema.category] === undefined) {
      editsByCategory[edits[edit].schema.category] = {}
    }
    editsByCategory[edits[edit].schema.category][edit] = edits[edit]
  }

  for (const category in editsByCategory) {
    if (editsByCategory[category] !== undefined && operationsByCategory[category] !== undefined) {
      await operationsByCategory[category](editsPipeline, edits)
    }
  }
}

/**
 * Scales down an image to a maximum dimensional size
 * @param editsPipeline
 * @param metadata
 */
export function restrictSize(editsPipeline: sharp.Sharp, metadata: sharp.Metadata): void {
  const maxImgWidth: number = getSetting('MAX_IMAGE_WIDTH')
  const maxImgHeight: number = getSetting('MAX_IMAGE_HEIGHT')
  let width: number | null = metadata.width as number
  let height: number | null = metadata.height as number

  if ((maxImgWidth && width > maxImgWidth) || (maxImgHeight && height > maxImgHeight)) {
    // NOTE: This originally had a "parseFloat" - but I'm not sure why. I removed it. If I created a bug, I'm sorry.
    const aspectRatio: number = width / height

    width = aspectRatio >= 1 ? maxImgWidth : null
    height = width === null ? maxImgHeight : null
    size.scaleMax(editsPipeline, width, height)
  }
}
