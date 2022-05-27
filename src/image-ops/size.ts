/**
 * This file should be restricted to dimensional size alterations to the image
 */
import sharp, {ResizeOptions, Sharp} from 'sharp'
import NotImplementedException from "../errors/NotImplementedException";
import {FillMode} from "../types/imgix";
import {ParsedEdits, ProcessedInputValueType} from "../types/common";
import InvalidDimensionsException from "../errors/InvalidDimensionsException";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema = require('../../data/schema')

/**
 * Apply all supported size operations
 * @param editsPipeline
 * @param edits
 * @return {Promise<void>}
 */
export async function apply(editsPipeline: Sharp, edits: ParsedEdits) {
  await beforeApply(editsPipeline, edits)

  const {w, h, fit, crop} = edits
  // The first thing we need to do is apply edits that affect the requested output size.
  if (w.processedValue || h.processedValue) {
    switch (fit.processedValue) {
    case 'clamp':
      // https://github.com/venveo/serverless-sharp/issues/26
      // Should extends the edge pixels outwards to match the given dimensions.
      // Not currently possible in Sharp.
      throw new NotImplementedException()
    case 'fillmax':
      // https://github.com/venveo/serverless-sharp/issues/27
      // Should resize the image while preserving aspect ratio within the dimensions given.
      // If the width or height exceeds the available width and height, fill with solid color or blurred image
      // Should be partially possible in Sharp. Just not a priority
      throw new NotImplementedException()
    case 'max':
      scaleMax(editsPipeline, <number>w.processedValue, <number>h.processedValue)
      break
    case 'min':
      await scaleCrop(editsPipeline, <number>w.processedValue, <number>h.processedValue, crop.processedValue, edits['fp-x'].processedValue, edits['fp-y'].processedValue)
      break
    case 'fill':
      await fill(editsPipeline, edits.fill.processedValue, w.processedValue, h.processedValue, edits['fill-color'].processedValue)
      break
    case 'scale':
      scale(editsPipeline, w.processedValue, h.processedValue)
      break
    case 'crop':
      await scaleCrop(editsPipeline, w.processedValue, h.processedValue, crop.processedValue, edits['fp-x'].processedValue, edits['fp-y'].processedValue)
      break
    case 'clip':
      scaleClip(editsPipeline, w.processedValue, h.processedValue)
      break
    }
  }
}

/**
 * @param {sharp} pipeline
 * @param width
 * @param height
 * @returns {*}
 */
export function scaleMax(pipeline: sharp.Sharp, width: number|null = null, height: number|null = null) {
  const resizeOptions: ResizeOptions = {
    width: width ?? undefined,
    height: height ?? undefined,
    fit: sharp.fit.inside,
    withoutEnlargement: true
  }
  pipeline.resize(resizeOptions)
}

/**
 *
 * @param {sharp} pipeline
 * @param width
 * @param height
 * @returns {*}
 */
export function scaleClip(pipeline: sharp.Sharp, width: number|null = null, height: number|null = null) {
  const resizeOptions: ResizeOptions = {
    width: width ?? undefined,
    height: height ?? undefined,
    fit: sharp.fit.inside,
    withoutEnlargement: false
  }
  pipeline.resize(resizeOptions)
}

/**
 *
 * @param {sharp} pipeline
 * @param mode
 * @param width
 * @param height
 * @param color
 * @returns {*}
 */
export async function fill(pipeline: sharp.Sharp, mode: FillMode, width = null, height = null, color = null) {
  const resizeParams: ResizeOptions = {
    withoutEnlargement: false,
    fit: sharp.fit.contain
  }
  if (width) {
    resizeParams.width = width
  }
  if (height) {
    resizeParams.height = height
  }
  if (color) {
    // either a color keyword or 3- (RGB), 4- (ARGB) 6- (RRGGBB) or 8-digit (AARRGGBB) hexadecimal values
    if (schema.colorKeywordValues.includes(color)) {
      // is a color keyword
      resizeParams.background = color
    } else if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
      // 3-digit (RGB)
      const r = parseInt(color[1] + color[1], 16)
      const g = parseInt(color[2] + color[2], 16)
      const b = parseInt(color[3] + color[3], 16)
      resizeParams.background = {r, g, b}
    } else if (/^#[0-9A-Fa-f]{4}$/.test(color)) {
      // 4-digit (ARGB)
      const alpha = parseInt(color[1] + color[1], 16) / 255.0
      const r = parseInt(color[2] + color[2], 16)
      const g = parseInt(color[3] + color[3], 16)
      const b = parseInt(color[4] + color[4], 16)
      resizeParams.background = {alpha, r, g, b}
    } else if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      // 6-digit (RRGGBB)
      const r = parseInt(color[1] + color[2], 16)
      const g = parseInt(color[3] + color[4], 16)
      const b = parseInt(color[5] + color[6], 16)
      resizeParams.background = {r, g, b}
    } else if (/^#[0-9A-Fa-f]{8}$/.test(color)) {
      // 8-digit (AARRGGBB)
      const alpha = parseInt(color[1] + color[2], 16) / 255.0
      const r = parseInt(color[3] + color[4], 16)
      const g = parseInt(color[5] + color[6], 16)
      const b = parseInt(color[7] + color[8], 16)
      resizeParams.background = {alpha, r, g, b}
    }
  }
  pipeline.resize(resizeParams)
}

/**
 * Stretch an image to fit the dimensions requested
 * @param pipeline
 * @param width
 * @param height
 * @returns {*}
 */
export function scale(pipeline: sharp.Sharp, width?: number, height?: number) {
  pipeline.resize({
    width,
    height,
    withoutEnlargement: true,
    fit: sharp.fit.fill
  })
}

/**
 * Handle cropping modes
 * @param {sharp} editsPipeline
 * @param width
 * @param height
 * @param crop
 * @param fpx
 * @param fpy
 * @returns {*}
 */
export async function scaleCrop(editsPipeline: sharp.Sharp, width: number|null = null, height: number|null = null, crop:string[] = [], fpx:number|null = null, fpy:number|null = null) {
  // top, bottom, left, right, faces, focalpoint, edges, and entropy
  // TODO: This should happen in the schemaParser
  if (!Array.isArray(crop)) {
    crop = []
  }

  // First we'll handle entropy mode - this one is simpler
  if (crop.includes('entropy')) {
    editsPipeline.resize({
      width: width ?? undefined,
      height: height ?? undefined,
      withoutEnlargement: false,
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy
    })
    return
  }

  // Now handle focalpoint, and left, right, top, bottom
  // extract metadata from image to resize
  const metadata = await editsPipeline.metadata()

  // I removed a parseFloat here because it seemed redundant
  const originalWidth = metadata.width as number
  const originalHeight = metadata.height as number

  const ratio = originalWidth / originalHeight

  if (width && !height) {
    height = width / ratio
  }
  if (height && !width) {
    width = height * ratio
  }
  if (!width || !height) {
    throw new InvalidDimensionsException()
  }
  // compute new width & height
  const factor = Math.max(width / originalWidth, height / originalHeight)
  // I removed a parseInt here because it seemed redundant
  const newWidth = Math.ceil(originalWidth * factor)
  const newHeight = Math.ceil(originalHeight * factor)

  // if we don't have a focal point, default to center-center
  if (crop.length && crop[0] !== 'focalpoint') {
    fpx = 0.5
    fpy = 0.5

    // use position arguments to set focal point, if provided
    if (crop.includes('left')) {
      fpx = 0
    } else if (crop.includes('right')) {
      fpx = 1
    }
    if (crop.includes('top')) {
      fpy = 0
    } else if (crop.includes('bottom')) {
      fpy = 1
    }
  }

  // TODO: Ensure fpx and fpy are never null! These should be set in the schema parser *I think*
  let fpxLeft = Math.floor((newWidth * fpx) - (0.5 * width))
  let fpyTop = Math.floor((newHeight * fpy) - (0.5 * height))

  // ensure extracted region doesn't exceed image bounds
  if (width > newWidth) {
    width = newWidth
  }
  if (height > newHeight) {
    height = newHeight
  }

  // adjust focal point x
  if (fpxLeft + width > newWidth) {
    fpxLeft = newWidth - width
  } else if (fpxLeft < 0) {
    fpxLeft = 0
  }

  // adjust focal point y
  if (fpyTop + height > newHeight) {
    fpyTop = newHeight - height
  } else if (fpyTop < 0) {
    fpyTop = 0
  }
  width = Math.ceil(width)
  height = Math.ceil(height)
  editsPipeline.resize({
    width: newWidth,
    height: newHeight,
    withoutEnlargement: false,
    fit: sharp.fit.fill
  }).extract({
    left: fpxLeft,
    top: fpyTop,
    width,
    height
  })
}

/**
 * We'll do any pre-work here
 * @param editsPipeline
 * @param edits
 */
export async function beforeApply(editsPipeline: sharp.Sharp, edits: ParsedEdits) {
  const {w, h, dpr, ar} = edits
  let processedWidth: ProcessedInputValueType = (w.processedValue as number|null) ?? null
  let processedHeight: ProcessedInputValueType = (h.processedValue as number|null) ?? null
  const processedAr: ProcessedInputValueType = (ar.processedValue as number|null) ?? null
  const processedDpr: ProcessedInputValueType = (dpr.processedValue as number|null) ?? null

  // Apply aspect ratio edits

  // Case 1: We have one dimension set
  if (processedAr && ((processedWidth && !processedHeight) || (processedHeight && !processedWidth))) {
    if (processedWidth) {
      processedHeight = processedWidth * processedAr
    }
    if (processedHeight) {
      processedWidth = processedHeight / processedAr
    }
  }

  // Case 2: We don't have dimensions set, so we need to look at the original image dimensions
  if (processedAr && ((!processedWidth && !processedHeight))) {
    const metadata = await editsPipeline.metadata()

    // I removed a parseInt here because it seemed redundant.
    const originalWidth = metadata.width as number
    const originalHeight = metadata.height as number

    processedHeight = originalHeight * (processedAr as number)
    processedWidth = originalWidth * (processedAr as number)
  }

  // Apply dpr edits
  if ((processedWidth || processedHeight) && processedDpr) {
    if (processedWidth) {
      processedWidth *= processedDpr
    }
    if (processedHeight) {
      processedHeight *= processedDpr
    }
  }
  edits.w.processedValue = processedWidth
  edits.h.processedValue = processedHeight
}
