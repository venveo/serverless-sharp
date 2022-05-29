/* eslint-env jest */
import * as valueNormalization from './valueNormalization'

describe('Testing remapNumberInRange', () => {

  test('In Range - Integer', () => {
    // Remap 0-100 to 0-200 with input of 50
    const result = valueNormalization.remapNumberInRange(0, 100, 0, 200, 50);
    expect(result).toStrictEqual(100);
  })

  test('In Range - Floating Point 1', () => {
    // Remap 0-100 to 0-200 with input of 50
    const result = valueNormalization.remapNumberInRange(-100, 100, 0, 1, -50);
    expect(result).toStrictEqual(0.25);
  })

  test('In Range - Floating Point 2', () => {
    // Remap 0-100 to 0-200 with input of 50
    const result = valueNormalization.remapNumberInRange(0, 1, 100, 101, 0.5);
    expect(result).toStrictEqual(100.5);
  })

  test('Clamp at High End', () => {
    // Remap 0-100 to 0-200 with input of 50
    const result = valueNormalization.remapNumberInRange(0, 100, 0, 200, 500);
    expect(result).toStrictEqual(200);
  })

  test('Clamp at Low End', () => {
    // Remap 0-100 to 0-200 with input of 50
    const result = valueNormalization.remapNumberInRange(0, 100, -10, 200, -250);
    expect(result).toStrictEqual(-10);
  })

  test('Multiplier in Range', () => {
    // Remap 0-100 to 0-200 with input of 50
    const result = valueNormalization.remapNumberInRange(0, 100, 0, 200, 50, 1.5);
    expect(result).toStrictEqual(150);
  })

  test('Multiplier not in Range', () => {
    // Remap 0-100 to 0-200 with input of 50
    const result = valueNormalization.remapNumberInRange(0, 100, 0, 200, 50, 5);
    expect(result).toStrictEqual(200);
  })
})