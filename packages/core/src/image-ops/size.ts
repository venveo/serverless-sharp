/**
 * This file should be restricted to dimensional size alterations to the image
 */
import sharp, {ResizeOptions, Sharp} from 'sharp'
import {CropMode, FillMode, ResizeFitMode} from "../types/imgix";
import {InputCropPosition, InputDimension, ParsedEdits} from "../types/common";
import {normalizeColorForSharp} from "../utils/valueNormalization";
import createHttpError from "http-errors";

/**
 * Apply all supported size operations
 * @param imagePipeline
 * @param edits
 * @return {Promise<void>}
 */
export async function apply(imagePipeline: Sharp, edits: ParsedEdits): Promise<Sharp> {
  await beforeApply(imagePipeline, edits)

  const {w, h, fit, crop} = edits
  // The first thing we need to do is apply edits that affect the requested output size.
  if (w.processedValue || h.processedValue) {
    switch (fit.processedValue) {
    case ResizeFitMode.CLAMP:
      // https://github.com/venveo/serverless-sharp/issues/26
      // Should extend the edge pixels outwards to match the given dimensions.
      throw new createHttpError.NotImplemented(`Received request for unimplemented operation: CLAMP`)
    case ResizeFitMode.FILL:
      if (edits.fill.processedValue) {
        imagePipeline = await fill(imagePipeline, edits.fill.processedValue, w.processedValue, h.processedValue, edits['fill-color'].processedValue ?? null, false)
      }
      break
    case ResizeFitMode.FILLMAX:
      if (edits.fill.processedValue) {
        imagePipeline = await fill(imagePipeline, edits.fill.processedValue, w.processedValue ?? null, h.processedValue ?? null, edits['fill-color'].processedValue ?? null, true)
      }
      break
    case ResizeFitMode.MAX:
      imagePipeline = scaleMax(imagePipeline, w.processedValue ?? null, h.processedValue ?? null)
      break
    case ResizeFitMode.MIN:
      imagePipeline = await scaleCrop(imagePipeline, w.processedValue, h.processedValue, crop.processedValue, edits['fp-x'].processedValue, edits['fp-y'].processedValue)
      break
    case ResizeFitMode.SCALE:
      imagePipeline = scale(imagePipeline, w.processedValue, h.processedValue)
      break
    case ResizeFitMode.CROP:
      imagePipeline = await scaleCrop(imagePipeline, w.processedValue, h.processedValue, crop.processedValue, edits['fp-x'].processedValue, edits['fp-y'].processedValue)
      break
    case ResizeFitMode.CLIP:
      imagePipeline = scaleClip(imagePipeline, w.processedValue, h.processedValue)
      break
    }
  }
  return Promise.resolve(imagePipeline)
}

/**
 * @param {sharp} pipeline
 * @param width
 * @param height
 * @returns {*}
 */
export function scaleMax(pipeline: sharp.Sharp, width: InputDimension | null = null, height: InputDimension | null = null) {
  const resizeOptions: ResizeOptions = {
    width: width ?? undefined,
    height: height ?? undefined,
    fit: sharp.fit.inside,
    withoutEnlargement: true
  }
  return pipeline.resize(resizeOptions)
}

/**
 *
 * @param {sharp} pipeline
 * @param width
 * @param height
 * @returns {*}
 */
export function scaleClip(pipeline: sharp.Sharp, width: InputDimension | null = null, height: InputDimension | null = null) {
  const resizeOptions: ResizeOptions = {
    width: width ?? undefined,
    height: height ?? undefined,
    fit: sharp.fit.inside,
    withoutEnlargement: false
  }
  return pipeline.resize(resizeOptions)
}

/**
 *
 * @param {sharp} pipeline
 * @param mode
 * @param width
 * @param height
 * @param color
 * @param withoutEnlargement
 * @returns {*}
 */
export async function fill(pipeline: sharp.Sharp, mode: FillMode, width: InputDimension | null = null, height: InputDimension | null = null, color: string | null, withoutEnlargement = true) {
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

  if (mode === FillMode.BLUR) {
    // This is a little weird, but we're doing it because blur is expensive and is faster on smaller images
    const blurredBg = sharp(await pipeline.clone().resize(200).blur(60).toBuffer()).resize({
      ...resizeParams,
      fit: sharp.fit.fill
    })
    blurredBg.composite([
      {
        input: await pipeline.resize({
          ...resizeParams,
          fit: sharp.fit.inside,
          withoutEnlargement: withoutEnlargement
        }).toBuffer()
      }
    ])
    return blurredBg
  }

  if (mode === FillMode.SOLID && color) {
    resizeParams.background = normalizeColorForSharp(color) ?? undefined
    return pipeline.resize(resizeParams)
  }
  return pipeline
}

/**
 * Stretch an image to fit the dimensions requested
 * @param pipeline
 * @param width
 * @param height
 * @returns {*}
 */
export function scale(pipeline: sharp.Sharp, width: InputDimension | null = null, height: InputDimension | null = null) {
  return pipeline.resize({
    width: width ?? undefined,
    height: height ?? undefined,
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
export async function scaleCrop(editsPipeline: sharp.Sharp, width: InputDimension | null = null, height: InputDimension | null = null, crop: InputCropPosition = [], fpx = 0.5, fpy = 0.5) {
  // First we'll handle entropy mode - this one is simpler
  if (crop.includes(CropMode.ENTROPY)) {
    return editsPipeline.resize({
      width: width ?? undefined,
      height: height ?? undefined,
      withoutEnlargement: false,
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy
    })
  }

  // Now handle focalpoint, and left, right, top, bottom
  // extract metadata from image to resize
  const metadata = await editsPipeline.metadata()

  // I removed a parseFloat here because it seemed redundant
  const originalWidth = <number>metadata.width
  const originalHeight = <number>metadata.height

  const ratio = originalWidth / originalHeight

  if (width && !height) {
    height = width / ratio
  }
  if (height && !width) {
    width = height * ratio
  }
  if (!width || !height) {
    throw new createHttpError.BadRequest(`Output width or height could not be determined`)
  }
  // compute new width & height
  const factor = Math.max(width / originalWidth, height / originalHeight)
  // I removed a parseInt here because it seemed redundant
  const newWidth = Math.ceil(originalWidth * factor)
  const newHeight = Math.ceil(originalHeight * factor)

  // if we don't have a focal point, default to center-center
  if (crop.length && crop[0] !== CropMode.FOCALPOINT) {
    fpx = 0.5
    fpy = 0.5

    // use position arguments to set focal point, if provided
    if (crop.includes(CropMode.LEFT)) {
      fpx = 0
    } else if (crop.includes(CropMode.RIGHT)) {
      fpx = 1
    }
    if (crop.includes(CropMode.TOP)) {
      fpy = 0
    } else if (crop.includes(CropMode.BOTTOM)) {
      fpy = 1
    }
  }

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
  const buffer = await editsPipeline.resize({
    width: newWidth,
    height: newHeight,
    withoutEnlargement: false,
    fit: sharp.fit.fill
  }).extract({
    left: fpxLeft,
    top: fpyTop,
    width,
    height
  }).toBuffer()
  return sharp(buffer)
}

/**
 * We'll do any pre-work here
 * @param editsPipeline
 * @param edits
 */
export async function beforeApply(editsPipeline: sharp.Sharp, edits: ParsedEdits) {
  const {w, h, dpr, ar} = edits
  let processedWidth = w.processedValue
  let processedHeight = h.processedValue
  const processedAr = ar.processedValue
  const processedDpr = dpr.processedValue
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

    const originalWidth = <number>metadata.width
    const originalHeight = <number>metadata.height

    processedHeight = originalHeight * processedAr
    processedWidth = originalWidth * processedAr
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
