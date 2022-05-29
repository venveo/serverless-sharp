/**
 * This file should be used for processes that involve adjusting colors in the image.
 */

import {Sharp} from "sharp";
import {ParsedEdits} from "../types/common";

/**
 * Applies all the adjustment edits to the image
 * @param imagePipeline
 * @param edits
 */
export async function apply(imagePipeline: Sharp, edits: ParsedEdits) {
  let outputPipeline = imagePipeline;
  if (edits.bri) {
    outputPipeline = await bri(imagePipeline, <number>edits.bri.processedValue)
  }
  return Promise.resolve(outputPipeline)
}

/**
 *
 * @param imagePipeline
 * @param val
 */
export function bri(imagePipeline: Sharp, val: number) {
  // Brightness isn't an exact match to Imgix, but it's pretty close. PR welcome.
  // Note: we're using lightness instead of brightness here - this is intentional. Sharp's brightness is a multiplier
  return Promise.resolve(imagePipeline.modulate({
    lightness: Math.min(200, Math.max(val, -200))
  }))
}
