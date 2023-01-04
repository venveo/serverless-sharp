/* eslint-env jest */
import {
  determineSuccessfulValue,
  getSchemaForQueryParams,
  normalizeAndValidateSchema,
  processDefaults,
  replaceAliases
} from './schemaParser';
import { AvailableIn, Category, ExpectedValueType, ImgixParameters, ParameterDefinition } from '../types/imgix';
import { ok } from 'neverthrow';
import { ParsedEdits, ParsedSchemaItem } from '../types/common';
import { schema } from './schema';

describe('replaceAliases', () => {
  it('should not break invalid parameters', () => {
    const replaced = replaceAliases({
      f: 'asdf',
      m: 'asdff',
      'no-touch': 'foo',
      fit: 'hello' // This will get over-written
    });

    expect(replaced).toMatchObject({
      fit: 'asdf',
      mark: 'asdff',
      'no-touch': 'foo'
    });
  });
});

describe('getSchemaForQueryParams', () => {
  it('should return only valid parameter definitions', () => {
    const properties = getSchemaForQueryParams({
      fm: 'jpg',
      w: '1920',
      foo: 'invalid'
    });
    expect(Object.keys(properties)).toEqual(['fm', 'w']);
    expect(properties.fm.display_name).toEqual('output format');
    expect(properties.w.display_name).toEqual('image width');
  });
});

describe('normalizeAndValidateSchema', () => {
  test('Invalid combination: png & q', () => {
    const request = {
      fm: 'png',
      'fp-x': '0.5',
      fit: 'crop',
      q: '75' // q can't be used with png - this should be dropped
    };
    const schema = getSchemaForQueryParams(request);

    expect(() => {
      normalizeAndValidateSchema(schema, request);
    }).not.toThrow();
  });

  test('Valid with jpg', () => {
    const request = {
      q: '75',
      fm: 'jpg'
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request);

    expect(validatedSchema.q.processedValue).toEqual(75);
    expect(validatedSchema.q.implicit).toEqual(false);
  });

  test('Valid', () => {
    const request = {
      f: 'png',
      'fp-x': '0.5',
      'fp-y': '0.5',
      fit: 'crop',
      crop: 'focalpoint'
    };
    const schema = getSchemaForQueryParams(request);

    expect(() => normalizeAndValidateSchema(schema, request)).not.toThrow();
  });

  // Two mode test
  test('Double mode - ratio', () => {
    const request = {
      w: '0.4'
    };
    const schema = getSchemaForQueryParams(request);

    expect(() => normalizeAndValidateSchema(schema, request)).not.toThrow();
  });

  test('Double mode -  int', () => {
    const request = {
      w: '100'
    };
    const schema = getSchemaForQueryParams(request);

    expect(() => normalizeAndValidateSchema(schema, request)).not.toThrow();
  });

  test('Max range normalization', () => {
    const request = {
      dpr: '100'
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request);

    expect(validatedSchema.dpr.processedValue).toEqual(5);
  });

  test('Min range normalization', () => {
    const request = {
      dpr: '-1'
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request);

    expect(validatedSchema.dpr.processedValue).toEqual(0);
  });

  test('Null value normalization', () => {
    // This is to handle urls like this: image.jpg?sharp
    // Should use default value if one exists
    const request = {
      sharp: ''
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request);

    expect(validatedSchema.sharp.processedValue).toEqual(0);
  });
});

describe('determineSuccessfulValue', () => {
  describe('test with single rule', () => {
    const testSchemaItem: ParameterDefinition = {
      expects: [
        {
          type: ExpectedValueType.Number
        }
      ],
      depends: [],
      display_name: 'Test',
      available_in: [AvailableIn.URL],
      category: Category.ADJUSTMENT,
      short_description: 'Just a test item'
    };

    it('should produce expected number', () => {
      const successfulResult: ParsedSchemaItem = {
        processedValue: 10,
        implicit: false,
        parameterDefinition: testSchemaItem
      };
      expect(determineSuccessfulValue('10', testSchemaItem)).toEqual(ok(successfulResult));
      expect(determineSuccessfulValue('10', testSchemaItem)).toHaveProperty('value');
      expect(determineSuccessfulValue('notanumber', testSchemaItem)).not.toHaveProperty('value');
    });
  });

  describe('test with multiple rules', () => {
    const testSchemaItem: ParameterDefinition = {
      expects: [
        {
          type: ExpectedValueType.Number
        },
        {
          type: ExpectedValueType.Boolean
        }
      ],
      depends: [],
      display_name: 'Test',
      available_in: [AvailableIn.URL],
      category: Category.ADJUSTMENT,
      short_description: 'Just a test item'
    };

    it('should produce expected number or respect boolean', () => {
      const successfulResultNumeric: ParsedSchemaItem = {
        processedValue: 10,
        implicit: false,
        parameterDefinition: testSchemaItem
      };
      const successfulResultBooleanTrue: ParsedSchemaItem = {
        processedValue: true,
        implicit: false,
        parameterDefinition: testSchemaItem
      };
      const successfulResultBooleanFalse: ParsedSchemaItem = {
        processedValue: false,
        implicit: false,
        parameterDefinition: testSchemaItem
      };
      expect(determineSuccessfulValue('10', testSchemaItem)).toEqual(ok(successfulResultNumeric));
      expect(determineSuccessfulValue('true', testSchemaItem)).toEqual(ok(successfulResultBooleanTrue));
      expect(determineSuccessfulValue('false', testSchemaItem)).toEqual(ok(successfulResultBooleanFalse));
      expect(determineSuccessfulValue('notanumberorboolean', testSchemaItem)).not.toHaveProperty('value');
    });
  });
});

describe('processDefaults', () => {
  test('propagates default values from schema', () => {
    const testSchema: ImgixParameters = {
      w: { ...schema.parameters.w, default: 100 },
      'fp-x': {
        ...schema.parameters['fp-x'],
        expects: [{ default: 0.5, type: ExpectedValueType.UnitScalar, strict_range: { min: 0, max: 1 } }]
      }
    };
    const original: ParsedEdits = {};
    const expected = {
      w: { processedValue: 100, implicit: true, parameterDefinition: testSchema.w },
      'fp-x': { processedValue: 0.5, implicit: true, parameterDefinition: testSchema['fp-x'] }
    };
    expect(processDefaults(original, testSchema)).toEqual(expected);
  });

  test('does not overwrite existing values', () => {
    const testSchema: ImgixParameters = {
      w: { ...schema.parameters.w, default: 100 },
      bg: { ...schema.parameters.bg, expects: [{ default: '#fff', type: ExpectedValueType.String }] }
    };
    const original: ParsedEdits = {
      w: {
        parameterDefinition: testSchema.w,
        implicit: false,
        processedValue: 250
      }
    };
    const expected = {
      w: original.w,
      bg: { processedValue: 'fff', implicit: true, parameterDefinition: testSchema.bg }
    };
    expect(processDefaults(original, testSchema)).toEqual(expected);
  });
});