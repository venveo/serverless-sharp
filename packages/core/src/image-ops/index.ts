import {getSetting} from "../utils/settings";
import {apply as applySize, scaleMax} from "./size";
import {apply as applyStylize} from "./stylize";
import {apply as applyAdjustment} from './adjustment'
import sharp, {Sharp} from "sharp";
import {ParsedEdits, ParsedSchemaItem} from "../types/common";
import createHttpError from "http-errors";

const operationsByCategory: { [category: string]: ((imagePipeline: sharp.Sharp, edits: ParsedEdits) => Promise<sharp.Sharp>) } = {
  adjustment: applyAdjustment,
  size: applySize,
  stylize: applyStylize
}

/**
 * Applies all supported image operations to the supplied image
 * @param editsPipeline
 * @param edits
 * @return {Promise<void>}
 */
export async function apply(editsPipeline: sharp.Sharp, edits: ParsedEdits) {
  // @see https://docs.imgix.com/setup/serving-assets#order-of-operations
  const editsByCategory: { [category: string]: { [edit: string]: ParsedSchemaItem } } = {
    adjustment: {},
    size: {},
    stylize: {},
  }
  for (const edit in edits) {
    if (editsByCategory[edits[edit].schema.category] === undefined) {
      editsByCategory[edits[edit].schema.category] = {}
    }
    editsByCategory[edits[edit].schema.category][edit] = edits[edit]
  }

  for (const category in editsByCategory) {
    if (editsByCategory[category] !== undefined && operationsByCategory[category] !== undefined) {
      const updatedEdits = await operationsByCategory[category](editsPipeline, edits)
      if (updatedEdits) {
        editsPipeline = updatedEdits
      }
    }
  }
  return editsPipeline
}

/**
 * Scales down an image to a maximum dimensional size
 * @param editsPipeline
 * @param metadata
 */
export function restrictSize(editsPipeline: sharp.Sharp, metadata: sharp.Metadata): Sharp {
  const maxImgWidth: number = <number>getSetting('MAX_IMAGE_WIDTH')
  const maxImgHeight: number = <number>getSetting('MAX_IMAGE_HEIGHT')
  let width = metadata.width ?? null
  let height = metadata.height ?? null
  if (!width || !height) {
    throw new createHttpError.BadRequest(`Either width or height on input object metadata could not be determined`)
  }

  if ((maxImgWidth && width > maxImgWidth) || (maxImgHeight && height > maxImgHeight)) {
    // NOTE: This originally had a "parseFloat" - but I'm not sure why. I removed it. If I created a bug, I'm sorry.
    const aspectRatio: number = width / height

    width = aspectRatio >= 1 ? maxImgWidth : null
    height = width === null ? maxImgHeight : null
    return scaleMax(editsPipeline, width, height)
  }
  return editsPipeline
}
