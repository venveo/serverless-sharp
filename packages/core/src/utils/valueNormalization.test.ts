/* eslint-env jest */
import { remapNumberInRange } from './valueNormalization';

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
