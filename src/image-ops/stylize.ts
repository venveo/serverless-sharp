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
 * @param image
 * @param val
 */
export function blur(editsPipeline: Sharp, val: number) {
  if (val === 0) {
    return
  }
  // We need to convert Imgix's scale of int(0) - int(2000) to float(0.3) - float(1000)
  const result = ((val - 0) / (2000 - 0)) * (1000 - 0.3) + 0.3
  // Seems like Imgix blurs a little less than we do, so this is just a magic number to make them more similar
  // result *= 0.22
  editsPipeline.blur(result)
}