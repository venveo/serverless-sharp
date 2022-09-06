import {ExpectedValueDefinition, ExpectedValueType, Imgix} from "../types/imgix";
import {ProcessedInputValueDetails} from "../types/common";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema: Imgix = require('../../data/schema.json')
type ValueProcessorTypeMap = Record<ExpectedValueType, CallableFunction>

/**
 *
 * @param type - expected value type to validate against
 * @param value - input value from query params
 * @param expects - ExpectedValueDefinition
 */
export function processInputValue(type: ExpectedValueType, value: string, expects: ExpectedValueDefinition | null = null): ProcessedInputValueDetails {
  const processorMap: ValueProcessorTypeMap = {
    [ExpectedValueType.String]: processString,
    [ExpectedValueType.List]: processList,
    [ExpectedValueType.Boolean]: processBoolean,
    [ExpectedValueType.Ratio]: processRatio,
    [ExpectedValueType.Integer]: processInteger,
    [ExpectedValueType.Number]: processNumber,
    [ExpectedValueType.UnitScalar]: processUnitScalar,
    [ExpectedValueType.Timestamp]: processTimestamp,
    [ExpectedValueType.URL]: processUrl,
    [ExpectedValueType.Path]: processPath,
    [ExpectedValueType.Font]: processFont,
    [ExpectedValueType.HexColor]: processHexColor,
    [ExpectedValueType.ColorKeyword]: processColorKeyword,
  }

  return processorMap[type](value, expects)
}

export function processString(value: string): ProcessedInputValueDetails {
  return {
    processedValue: value,
    passed: value.length > 0,
    message: !value.length ? 'String value was empty' : null
  }
}

export function processList(value: string, expects: ExpectedValueDefinition | null = null): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }

  const items = value.split(',')
  if (!items.length) {
    result.message = 'At least one item expected'
    return result
  }
  if (expects && expects.possible_values !== undefined) {
    const difference = items.filter(x => !(expects.possible_values as Array<string | number>).includes(x))
    if (difference.length > 0) {
      // Unexpected value encountered
      result.message = 'Invalid value encountered. Expected one of: ' + expects.possible_values.join(',')
      return result
    }
  }
  result.processedValue = items
  result.passed = true
  return result
}

export function processBoolean(value: string): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }

  if (value === 'true' || value === '1') {
    result.passed = true
    result.processedValue = true
  } else if (value === 'false' || value === '0') {
    result.passed = true
    result.processedValue = false
  } else {
    result.message = 'Expected a boolean-like value'
  }
  return result
}

export function processRatio(value: string): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }
  const match = value.match(/([0-9]*[.]?[0-9]+):+(([0-9]*[.])?[0-9]+)$/)
  if (!match || match.length < 3) {
    result.message = 'Expected ratio format: 1.0:1.0'
    return result
  }
  if (parseFloat(match[1]) === 0) {
    result.message = 'Cannot divide by zero'
    return result
  }
  // For example: 16:9 = 9/16 = .5625
  result.processedValue = parseFloat(match[2]) / parseFloat(match[1])
  result.passed = true

  return result
}

export function processInteger(value: string, expects: ExpectedValueDefinition | null = null): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }

  const valueAsInt = parseInt(value)
  if (isNaN(valueAsInt)) {
    result.message = 'NaN'
    return result
  }
  result.processedValue = valueAsInt

  if (expects && expects.strict_range !== undefined) {
    if (expects.strict_range.max !== undefined && valueAsInt > expects.strict_range.max) {
      result.message = 'Value out of range (too large)'
      return result
    }
    if (expects.strict_range.min !== undefined && valueAsInt < expects.strict_range.min) {
      result.message = 'Value out of range (too small)'
      return result
    }
  } else if (expects && expects.possible_values !== undefined) {
    if (!expects.possible_values.includes(value)) {
      result.message = 'Invalid value encountered. Expected one of: ' + expects.possible_values.join(',')
      return result
    }
  }
  result.passed = true

  return result
}

export function processNumber(value: string, expects: ExpectedValueDefinition | null = null): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }
  let valueAsFloat = parseFloat(value);
  if (isNaN(valueAsFloat)) {
    result.message = 'NaN'
    return result
  }
  // Clamp the value between any defined min and max
  if (expects && expects.strict_range !== undefined) {
    if (expects.strict_range.min !== undefined && valueAsFloat < expects.strict_range.min) {
      valueAsFloat = expects.strict_range.min
    } else if (expects.strict_range.max && valueAsFloat > expects.strict_range.max) {
      valueAsFloat = expects.strict_range.max
    }
  }
  result.processedValue = valueAsFloat
  result.passed = true

  return result
}

export function processUnitScalar(value: string, expects: ExpectedValueDefinition | null = null): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }

  const valueAsFloat = parseFloat(value)
  if (isNaN(valueAsFloat)) {
    result.message = 'NaN'
    return result
  }
  result.processedValue = valueAsFloat
  if (expects && expects.strict_range !== undefined) {
    if (expects.strict_range.min !== undefined && valueAsFloat < expects.strict_range.min) {
      result.message = 'Value out of range'
      return result
    }
    if (expects.strict_range.max !== undefined && valueAsFloat > expects.strict_range.max) {
      result.message = 'Value out of range'
      return result
    }
  }
  result.passed = true

  return result
}

export function processTimestamp(value: string): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }

  if (!((new Date(value)).getTime() > 0)) {
    result.message = 'Expected valid unix timestamp'
    return result
  }
  result.processedValue = value
  result.passed = true

  return result
}

export function processUrl(value: string): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }

  if (!value.match(/^(http|https):\/\/[^ "]+$/)) {
    result.message = 'Expected valid URL'
    return result
  }
  result.processedValue = value
  result.passed = true
  return result
}

export function processPath(value: string): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }
  // TODO: How can we verify a valid path, and what is it even used for?
  result.processedValue = value
  result.passed = true

  return result
}

export function processFont(value: string): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }
  // TODO: Check our list of valid fonts.
  result.processedValue = value
  result.passed = true

  return result
}

export function processHexColor(value: string): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }

  if (!value.match(/^(?:[0-9a-fA-F]{4}){1,2}|(?:[0-9a-fA-F]{3}){1,2}$/)) {
    result.message = 'Expected hex color code like: fff'
    return result
  }
  result.passed = true
  result.processedValue = '#' + value

  return result
}

export function processColorKeyword(value: string): ProcessedInputValueDetails {
  const result: ProcessedInputValueDetails = {
    passed: false,
    message: null,
    processedValue: undefined
  }

  if (!schema.colorKeywordValues.includes(value)) {
    result.message = 'Expected valid color name'
    return result
  }

  result.passed = true
  result.processedValue = value
  return result
}