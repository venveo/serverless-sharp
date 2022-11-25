import * as inputValueProcessor from "./inputValueProcessor";
import {ExpectedValueDefinition, ExpectedValueType} from "../types/imgix";

describe('String Value Processor', () => {
  test('Valid string', function () {
    const result = inputValueProcessor.processString('Test')

    expect(result.processedValue).toEqual('Test')
    expect(result.passed).toEqual(true)
    expect(result.message).toBeNull()
  });

  test('Empty string is invalid', function () {
    const result = inputValueProcessor.processString('')

    expect(result.passed).toEqual(false)
    expect(result.message).not.toBeNull()
  });

  test('Falsy string is valid', function () {
    const result = inputValueProcessor.processString('0')

    expect(result.processedValue).toEqual('0')
    expect(result.passed).toEqual(true)
    expect(result.message).toBeNull()
  });
})


describe('List Value Processor - Expectation: possible_values', () => {
  const possible_values: ExpectedValueDefinition = {
    type: ExpectedValueType.List,
    "possible_values": [
      "start",
      "middle",
      "end",
      "ellipsis"
    ]
  };
  test('Valid - list of multiple items', function () {
    const result = inputValueProcessor.processList('start,end', possible_values)

    expect(result.processedValue).toEqual(['start', 'end'])
    expect(result.passed).toEqual(true)
    expect(result.message).toBeNull()
  });

  test('Valid - list of single item', function () {
    const result = inputValueProcessor.processList('end', possible_values)

    expect(result.processedValue).toEqual(['end'])
    expect(result.passed).toEqual(true)
    expect(result.message).toBeNull()
  });

  test('Invalid - includes prohibited item', function () {
    const result = inputValueProcessor.processList('end,foo', possible_values)

    expect(result.passed).toEqual(false)
    expect(result.message).not.toBeNull()
  });

  test('Invalid - empty input', function () {
    const result = inputValueProcessor.processList('', possible_values)

    expect(result.passed).toEqual(false)
    expect(result.message).not.toBeNull()
  });
});


describe('List Value Processor - No Expectation', () => {
  test('Valid - list of multiple items', function () {
    const result = inputValueProcessor.processList('start,end')

    expect(result.processedValue).toEqual(['start', 'end'])
    expect(result.passed).toEqual(true)
    expect(result.message).toBeNull()
  })
})