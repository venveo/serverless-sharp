import {getSetting} from "../utils/settings";
import {apply as applySize, scaleMax} from "./size";
import {apply as applyStylize} from "./stylize";
import {apply as applyAdjustment} from './adjustment'
import type { Metadata, Sharp } from 'sharp';
import type {ParsedEdits, ParsedSchemaItem} from "../types/common";
import createHttpError from "http-errors";

const operationsByCategory: { [category: string]: ((imagePipeline: Sharp, edits: ParsedEdits) => Promise<Sharp>) } = {
  adjustment: applyAdjustment,
  size: applySize,
  stylize: applyStylize
}

/**
 * Applies all supported image operations to the supplied image
 * @param editsPipeline - input Sharp pipeline
 * @param edits - edits object
 */
export async function apply(editsPipeline: Sharp, edits: ParsedEdits): Promise<Sharp> {
  // @see https://docs.imgix.com/setup/serving-assets#order-of-operations
  const editsByCategory: { [category: string]: { [edit: string]: ParsedSchemaItem } } = {
    adjustment: {},
    size: {},
    stylize: {},
  }
  for (const edit in edits) {
    if (editsByCategory[edits[edit].parameterDefinition.category] === undefined) {
      editsByCategory[edits[edit].parameterDefinition.category] = {}
    }
    editsByCategory[edits[edit].parameterDefinition.category][edit] = edits[edit]
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
 * @param editsPipeline - input Sharp pipeline
 * @param metadata - resolved sharp metadata
 */
export function restrictSize(editsPipeline: Sharp, metadata: Metadata): Sharp {
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
