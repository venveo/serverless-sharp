import {Sharp} from "sharp";
import {ParsedEdits} from "../types/common";
import {remapNumberInRange} from "../utils/valueNormalization";

/**
 *
 * @param editsPipeline
 * @param edits
 */
export function apply(editsPipeline: Sharp, edits: ParsedEdits) {
  // Blur has a default value of 0, so as long as its set, we should go ahead and process it.
  if (edits?.blur) {
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
  const result = remapNumberInRange(imgixMin, imgixMax, sharpMin, sharpMax, sigma, blurMultiplier)
  editsPipeline.blur(result)
}