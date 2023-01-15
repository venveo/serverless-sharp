import { describe, expect, it, test } from 'vitest'

import * as inputValueProcessor from './input-value-processor';
import { ExpectedValueType, ParameterValueRule } from '../types/imgix';
import { ok } from 'neverthrow';

describe('String Value Processor', () => {
  it('Should accept a string with a value', function() {
    const result = inputValueProcessor.processString('Test');
    expect(result).toHaveProperty('value');
    expect(result).toEqual(ok('Test'));
  });

  it('Should reject an empty string', function() {
    const result = inputValueProcessor.processString('');
    expect(result).not.toHaveProperty('value');
  });

  it('Should allow falsy strings', function() {
    const result = inputValueProcessor.processString('0');
    expect(result).toHaveProperty('value');
    expect(result).toEqual(ok('0'));
  });
});

describe('List Value Processor', () => {

  describe('Expectation: possible_values', () => {
    const possible_values: ParameterValueRule = {
      type: ExpectedValueType.List,
      'possible_values': [
        'start',
        'middle',
        'end',
        'ellipsis'
      ]
    };
    test('Valid - list of multiple items', function() {
      const result = inputValueProcessor.processList('start,end', possible_values);
      expect(result).toHaveProperty('value');
      expect(result).toEqual(ok(['start', 'end']));
    });

    test('Valid - list of single item', function() {
      const result = inputValueProcessor.processList('end', possible_values);

      expect(result).toHaveProperty('value');
      expect(result).toEqual(ok(['end']));
    });

    test('Invalid - includes prohibited item', function() {
      const result = inputValueProcessor.processList('end,foo', possible_values);
      expect(result).not.toHaveProperty('value');
    });

    test('Invalid - empty input', function() {
      const result = inputValueProcessor.processList('', possible_values);
      expect(result).not.toHaveProperty('value');
    });
  });


  describe('No Expectation', () => {
    test('Valid - list of multiple items', function() {
      const result = inputValueProcessor.processList('start,end');

      expect(result).toEqual(ok(['start', 'end']));
    });
  });
});

describe('Process Boolean', () => {
  it('Should process \'1\', \'true\', and \'yes\' as true', function() {
    expect(inputValueProcessor.processBoolean('1')).toEqual(ok(true));
    expect(inputValueProcessor.processBoolean('true')).toEqual(ok(true));
    expect(inputValueProcessor.processBoolean('yes')).toEqual(ok(true));
  });
  it('Should process \'0\', \'false\', and \'no\' as false', function() {
    expect(inputValueProcessor.processBoolean('0')).toEqual(ok(false));
    expect(inputValueProcessor.processBoolean('false')).toEqual(ok(false));
    expect(inputValueProcessor.processBoolean('no')).toEqual(ok(false));
  });
  it('Should not process ambiguous strings', function() {
    expect(inputValueProcessor.processBoolean('nope')).not.toHaveProperty('value');
    expect(inputValueProcessor.processBoolean('')).not.toHaveProperty('value');
    expect(inputValueProcessor.processBoolean(' ')).not.toHaveProperty('value');
    expect(inputValueProcessor.processBoolean(' 0 ')).not.toHaveProperty('value');
    expect(inputValueProcessor.processBoolean(' 1 ')).not.toHaveProperty('value');
  });
});

describe('Process Ratio', () => {
  it('Should accept ##:## notation', function() {
    expect(inputValueProcessor.processRatio('1:1')).toEqual(ok(1));
    expect(inputValueProcessor.processRatio('0.85:0.9')).toEqual(ok(0.85 / 0.9));
  });
  it('Should not divide by zero', function() {
    expect(inputValueProcessor.processRatio('1:0')).not.toHaveProperty('value');
  });
});

describe('Process Integer', () => {
  it('Should accept integers (no range)', function() {
    expect(inputValueProcessor.processInteger('1')).toEqual(ok(1));
    expect(inputValueProcessor.processInteger('34')).toEqual(ok(34));
  });

  it('Should not accept out of range items', function() {
    expect(inputValueProcessor.processInteger('-20', {
      strict_range: { min: -10, max: 100 },
      type: ExpectedValueType.Number
    })).not.toHaveProperty('value');

    expect(inputValueProcessor.processInteger('15', {
      strict_range: { min: -10, max: 100 },
      type: ExpectedValueType.Number
    })).toEqual(ok(15));

    expect(inputValueProcessor.processInteger('101', {
      strict_range: { min: -10, max: 100 },
      type: ExpectedValueType.Number
    })).not.toHaveProperty('value');
  });

  it('Should not accept items not in list', function() {
    expect(inputValueProcessor.processInteger('11', {
      possible_values: [10, 20, 30],
      type: ExpectedValueType.Number
    })).not.toHaveProperty('value');

    expect(inputValueProcessor.processInteger('10', {
      possible_values: [10, 20, 30],
      type: ExpectedValueType.Number
    })).toEqual(ok(10));
  });
});