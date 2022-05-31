/**
 * Remaps a number to a given range
 * e.g. 0-100 => -1000-0
 * @param originalMin
 * @param originalMax
 * @param newMin
 * @param newMax
 * @param input
 * @param multiplier the result will be multiplied by this value before being clamped to the range. Defaults to 1
 */
export function remapNumberInRange(originalMin: number, originalMax: number, newMin: number, newMax: number, input: number, multiplier = 1): number {
  let result = ((input - originalMin) / (originalMax - originalMin)) * (newMax - newMin) + newMin
  result *= multiplier
  // Clamp the result to valid input range
  return Math.max(newMin, Math.min(newMax, result))
}