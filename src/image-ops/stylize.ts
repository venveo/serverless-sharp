import {Sharp} from "sharp";
import {ParsedEdits} from "../types/common";

/**
 *
 * @param editsPipeline
 * @param edits
 */
export function apply(editsPipeline: Sharp, edits: ParsedEdits) {
  if (edits.blur && edits.blur.processedValue !== 0) {
    blur(editsPipeline, edits.blur.processedValue as number)
  }
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
    return
  }
  let result = ((sigma - imgixMin) / (imgixMax - imgixMin)) * (sharpMax - sharpMin) + sharpMin
  // Seems like Imgix blurs a little less than we do, so this is just a magic number to make them more similar
  result *= blurMultiplier
  // Clamp the result to valid input range
  result = Math.max(sharpMin, Math.min(sharpMax, result))
  editsPipeline.blur(result)
}