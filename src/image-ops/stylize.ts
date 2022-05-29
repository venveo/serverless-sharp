import sharp, {Sharp} from "sharp";
import {ParsedEdits} from "../types/common";
import {remapNumberInRange} from "../utils/valueNormalization";

/**
 *
 * @param editsPipeline
 * @param edits
 */
export async function apply(editsPipeline: Sharp, edits: ParsedEdits) {
  // Blur has a default value of 0, so as long as its set, we should go ahead and process it.
  if (edits?.blur) {
    editsPipeline = blur(editsPipeline, edits.blur.processedValue as number)
  }
  if (edits?.px) {
    editsPipeline = await px(editsPipeline, edits.px.processedValue as number)
  }
  return Promise.resolve(editsPipeline)
}

/**
 *
 * @param editsPipeline
 * @param sigma
 */
export function blur(editsPipeline: Sharp, sigma: number) {
  // We need to convert Imgix's scale of int(0) - int(2000) to float(0.3) - float(1000)
  const blurMultiplier = 0.22
  const imgixMax = 2000
  const imgixMin = 0
  const sharpMin = 0.3
  const sharpMax = 1000
  if (sigma <= 0) {
    return editsPipeline
  }
  const result = remapNumberInRange(imgixMin, imgixMax, sharpMin, sharpMax, sigma, blurMultiplier)
  editsPipeline.blur(result)
  return editsPipeline
}

/**
 * Pixelates the output image. Note, this could probably use some work. Colors don't match Imgix.
 * @param editsPipeline
 * @param px
 */
export async function px(editsPipeline: Sharp, px = 0) {
  // Ensure range is between 0 and 100
  px = Math.max(0, Math.min(100, px))
  if (px === 0) {
    return Promise.resolve(editsPipeline)
  }
  const metadata = await editsPipeline.metadata()
  const buffer = await editsPipeline.toBuffer()
  const resized = await sharp(buffer).resize(Math.floor(<number>metadata.width / px), null, { kernel: sharp.kernel.nearest }).toBuffer()
  return Promise.resolve(sharp(resized).resize(metadata.width, null, { kernel: sharp.kernel.nearest }))
}