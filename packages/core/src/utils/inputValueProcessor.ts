import { ParameterValueRule, ExpectedValueType, Imgix, ParameterValueRulePossibleValueTypes } from '../types/imgix';
import { err, ok, Result } from 'neverthrow';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema: Imgix = require('../../../../data/schema.json');

type ValidResponseType = string | number | Array<string | number> | boolean
type ValueProcessorResult = Result<ValidResponseType, string>
type ValueProcessorSignature = (value: string, expects?: ParameterValueRule | null) => ValueProcessorResult

/**
 *
 * @param type - expected value type to validate against
 * @param value - input value from query params
 * @param expects - ParameterValueRule
 */
export function processInputValue(type: ExpectedValueType, value: string, expects: ParameterValueRule | null = null): ValueProcessorResult {
  const processorMap: Record<ExpectedValueType, ValueProcessorSignature> = {
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
    [ExpectedValueType.ColorKeyword]: processColorKeyword
  };

  return processorMap[type](value, expects);
}

export function processString(value: string): Result<string, string> {
  if (!value.length) {
    return err('String value was empty');
  }
  return ok(value);
}

export function processList(value: string, expects: ParameterValueRule | null = null): Result<Array<ParameterValueRulePossibleValueTypes>, string> {
  const items = value.split(',');
  if (!items.length) {
    return err('At least one item is expected');
  }
  if (expects && expects.possible_values !== undefined) {
    const difference = items.filter(x => !(expects.possible_values as Array<ParameterValueRulePossibleValueTypes>).includes(x));
    if (difference.length > 0) {
      // Unexpected value encountered
      const message = 'Invalid value encountered. Expected one of: ' + expects.possible_values.join(',');
      return err(message);
    }
  }
  return ok(items);
}

export function processBoolean(value: string): Result<boolean, string> {
  if (value === 'true' || value === '1' || value === 'yes') {
    return ok(true);
  } else if (value === 'false' || value === '0' || value === 'no') {
    return ok(false);
  }
  return err('Expected a boolean-like value');
}

export function processRatio(value: string): Result<number, string> {
  const match = value.match(/([0-9]*[.]?[0-9]+):+(([0-9]*[.])?[0-9]+)$/);
  if (!match || match.length < 3) {
    return err('Expected ratio format: 1.0:1.0');
  }
  if (parseFloat(match[2]) === 0) {
    return err('Cannot divide by zero');
  }
  // For example: 16:9 = 16/9 = 1.777777777777778
  return ok(parseFloat(match[1]) / parseFloat(match[2]));
}

export function processInteger(value: string, expects: ParameterValueRule | null = null): Result<number, string> {

  const valueAsInt = parseInt(value);
  if (isNaN(valueAsInt)) {
    return err('Not a number');
  }

  if (expects && expects.strict_range !== undefined) {
    if (expects.strict_range.max !== undefined && valueAsInt > expects.strict_range.max) {
      return err('Value out of range (too large)');
    }
    if (expects.strict_range.min !== undefined && valueAsInt < expects.strict_range.min) {
      return err('Value out of range (too small)');
    }
  } else if (expects && expects.possible_values !== undefined) {
    if (!expects.possible_values.includes(valueAsInt)) {
      const message = 'Invalid value encountered. Expected one of: ' + expects.possible_values.join(',');
      return err(message);
    }
  }
  return ok(valueAsInt);
}

export function processNumber(value: string, expects: ParameterValueRule | null = null): Result<number, string> {
  let valueAsFloat = parseFloat(value);
  if (isNaN(valueAsFloat)) {
    return err('Not a number');
  }
  // Clamp the value between any defined min and max
  if (expects && expects.strict_range !== undefined) {
    if (expects.strict_range.min !== undefined && valueAsFloat < expects.strict_range.min) {
      valueAsFloat = expects.strict_range.min;
    } else if (expects.strict_range.max && valueAsFloat > expects.strict_range.max) {
      valueAsFloat = expects.strict_range.max;
    }
  }

  return ok(valueAsFloat);
}

export function processUnitScalar(value: string, expects: ParameterValueRule | null = null): Result<number, string> {
  const valueAsFloat = parseFloat(value);
  if (isNaN(valueAsFloat)) {
    return err('Not a number');
  }
  if (expects && expects.strict_range !== undefined) {
    if (expects.strict_range.min !== undefined && valueAsFloat < expects.strict_range.min) {
      return err('Value out of range (too small)');
    }
    if (expects.strict_range.max !== undefined && valueAsFloat > expects.strict_range.max) {
      return err('Value out of range (too big)');
    }
  }
  return ok(valueAsFloat);
}

export function processTimestamp(value: string): Result<number, string> {
  const valueAsTimestamp = (new Date(value)).getTime();
  if (!(valueAsTimestamp > 0)) {
    return err('Expected valid unix timestamp');
  }
  return ok(valueAsTimestamp);
}

export function processUrl(value: string): Result<string, string> {
  // We don't support any URL based operations yet
  console.warn('Unexpected call to processUrl')
  if (!value.match(/^(http|https):\/\/[^ "]+$/)) {
    return err('Expected valid URL');
  }
  return ok(value);
}

export function processPath(value: string): Result<string, string> {
  console.warn('Unexpected call to processPath')
  // How can we verify a valid path, and what is it even used for?
  // We don't support any path operations yet
  return ok(value);
}

export function processFont(value: string): Result<string, string> {
  console.warn('Unexpected call to processFont')
  // We don't support any text operations yet.
  // @see https://sharp.pixelplumbing.com/install#fonts
  return ok(value);
}

export function processHexColor(value: string): Result<string, string> {
  if (!value.match(/^(?:[0-9a-fA-F]{4}){1,2}|(?:[0-9a-fA-F]{3}){1,2}$/)) {
    return err('Expected hex color code like: fff');
  }
  return ok('#' + value);
}

export function processColorKeyword(value: string): Result<string, string> {
  if (!schema.colorKeywordValues.includes(value)) {
    return err('Expected valid color name');
  }
  return ok(value);
}