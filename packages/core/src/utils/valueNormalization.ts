import { Color } from 'sharp';
import { schema } from './schema';

/**
 * Remaps a number to a given range
 * e.g. 0-100 mapped to -1000-0
 * @param originalMin - original minimum value of the range
 * @param originalMax - original maximum value of the range
 * @param newMin - new minimum value of the range
 * @param newMax - new maximum value of the range
 * @param input - the number to apply to the new scale
 * @param multiplier - the result will be multiplied by this value before being clamped to the range. Defaults to 1
 */
export function remapNumberInRange(originalMin: number, originalMax: number, newMin: number, newMax: number, input: number, multiplier = 1): number {
  let result = ((input - originalMin) / (originalMax - originalMin)) * (newMax - newMin) + newMin;
  result *= multiplier;
  // Clamp the result to valid input range
  return Math.max(newMin, Math.min(newMax, result));
}


/**
 *
 * @param color - a color value in one of these formats:
 *  - color keyword
 *  - RGB
 *  - ARGB
 *  - RRGGBB
 *  - AARRGGBB (8-digit hexadecimal values)
 */
export function normalizeColorForSharp(color: string): Color | null {
  if (schema.colorKeywordValues.includes(color)) {
    return color;
  }
  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  if (!hexColorRegex.test(color)) {
    return null;
  }
  if (color.length === 4) {
    // 3-digit (RGB)
    const r = parseInt(color[1] + color[1], 16);
    const g = parseInt(color[2] + color[2], 16);
    const b = parseInt(color[3] + color[3], 16);
    return { r, g, b };
  }
  if (color.length === 5) {
    // 4-digit (ARGB)
    const alpha = parseInt(color[1] + color[1], 16) / 255.0;
    const r = parseInt(color[2] + color[2], 16);
    const g = parseInt(color[3] + color[3], 16);
    const b = parseInt(color[4] + color[4], 16);
    return { alpha, r, g, b };
  }
  if (color.length === 7) {
    // 6-digit (RRGGBB)
    const r = parseInt(color[1] + color[2], 16);
    const g = parseInt(color[3] + color[4], 16);
    const b = parseInt(color[5] + color[6], 16);
    return { r, g, b };
  }
  if (color.length === 9) {
    // 8-digit (AARRGGBB)
    const alpha = parseInt(color[1] + color[2], 16) / 255.0;
    const r = parseInt(color[3] + color[4], 16);
    const g = parseInt(color[5] + color[6], 16);
    const b = parseInt(color[7] + color[8], 16);
    return { alpha, r, g, b };
  }
  // This shouldn't be possible; but, we need to it to make TypeScript happy.
  return null;
}