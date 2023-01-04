/* eslint-env jest */
import { normalizeColorForSharp, remapNumberInRange } from './valueNormalization';

describe('remapNumberInRange', () => {
  it('should map the input number to the new range', () => {
    expect(remapNumberInRange(0, 100, -1000, 0, 50)).toEqual(-500);
  });

  it('should apply the multiplier to the result', () => {
    expect(remapNumberInRange(0, 100, -1000, 0, 50, 2)).toEqual(-1000);
  });

  it('should clamp the result to the new range', () => {
    expect(remapNumberInRange(0, 100, -1000, 0, 150)).toEqual(0);
    expect(remapNumberInRange(0, 100, -1000, 0, -50)).toEqual(-1000);
  });

  it('should handle edge cases', () => {
    expect(remapNumberInRange(0, 100, -1000, 0, 0)).toEqual(-1000);
    expect(remapNumberInRange(0, 100, -1000, 0, 100)).toEqual(0);
  });

  it('should allow multiplier in range', () => {
    const result = remapNumberInRange(0, 100, 0, 200, 50, 1.5);
    expect(result).toStrictEqual(150);
  });

  it('should handle multiplier not in Range', () => {
    expect(remapNumberInRange(0, 100, 0, 200, 50, 5)).toStrictEqual(200);
  });

  it('should handle floating points with negatives', () => {
    expect(remapNumberInRange(-100, 100, 0, 1, -50)).toStrictEqual(0.25);
  });

  it('should handle floating points without negatives', () => {
    expect(remapNumberInRange(0, 1, 100, 101, 0.5)).toStrictEqual(100.5);
  });
});


describe('normalizeColorForSharp', () => {
  it('should return the input color if it is a color keyword', () => {
    const color = 'red';
    expect(normalizeColorForSharp(color)).toBe(color);
  });

  it('should return the normalized color for a 3-digit hexadecimal color value', () => {
    const color = '#123';
    const expectedColor = { r: 0x11, g: 0x22, b: 0x33 };
    expect(normalizeColorForSharp(color)).toEqual(expectedColor);
  });

  it('should return the normalized color for a 4-digit hexadecimal color value', () => {
    const color = '#1234';
    const expectedColor = { alpha: 0x11 / 255.0, r: 0x22, g: 0x33, b: 0x44 };
    expect(normalizeColorForSharp(color)).toEqual(expectedColor);
  });

  it('should return the normalized color for a 6-digit hexadecimal color value', () => {
    const color = '#123456';
    const expectedColor = { r: 0x12, g: 0x34, b: 0x56 };
    expect(normalizeColorForSharp(color)).toEqual(expectedColor);
  });

  it('should return the normalized color for a 8-digit hexadecimal color value', () => {
    const color = '#12345678';
    const expectedColor = { alpha: 0x12 / 255.0, r: 0x34, g: 0x56, b: 0x78 };
    expect(normalizeColorForSharp(color)).toEqual(expectedColor);
  });

  it('should throw an error for an invalid color value', () => {
    const color = 'invalid';
    expect(normalizeColorForSharp(color)).toBeNull();
  });
});
