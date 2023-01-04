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
import { ParsedSchemaItem, QueryStringParameters, EditsSubset } from '../types/common';
import { schema as imgixSchema } from './schema';

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
  it('should drop invalid parameter combinations: png & q', () => {
    const request = {
      fm: 'png',
      'fp-x': '0.5',
      fit: 'crop',
      q: '75' // q can't be used with png - this should be dropped
    };
    const schema = getSchemaForQueryParams(request);
    const normalizedSchema = normalizeAndValidateSchema(schema, request, imgixSchema.parameters);

    expect(normalizedSchema.fm.processedValue).toEqual('png');
    expect(normalizedSchema.fm.implicit).toEqual(false);
    expect(normalizedSchema['fp-x'].processedValue).toEqual(0.5);
    expect(normalizedSchema['fp-x'].implicit).toEqual(false);
    expect(normalizedSchema.fit.processedValue).toEqual('crop');
    expect(normalizedSchema.fit.implicit).toEqual(false);
    expect(normalizedSchema.q.processedValue).toBeUndefined();
    expect(normalizedSchema.q.implicit).toEqual(true);
  });

  it('should allow quality with jpg', () => {
    const request = {
      q: '75',
      fm: 'jpg'
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request, imgixSchema.parameters);

    expect(validatedSchema.q.processedValue).toEqual(75);
    expect(validatedSchema.q.implicit).toEqual(false);
    expect(validatedSchema.fm.processedValue).toEqual('jpg');
    expect(validatedSchema.fm.implicit).toEqual(false);
  });

  it('should work with dependencies that need only be present (valid)', () => {
    const request = {
      'trim-pad': '100',
      'trim': 'auto',
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request, imgixSchema.parameters);

    expect(validatedSchema['trim-pad'].processedValue).toEqual(100);
    expect(validatedSchema['trim'].processedValue).toEqual('auto');
  });

  it('should work with dependencies that need only be present (invalid item removed)', () => {
    const request = {
      'trim-pad': '100',
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request, imgixSchema.parameters);

    expect(validatedSchema['trim-pad'].processedValue).toBeUndefined();
  });

  it('should remove parameters without values', () => {
    const request = {
      lossless: ''
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request, imgixSchema.parameters);

    expect(validatedSchema.lossless.processedValue).toEqual(false)
  });

  it('should pass additional complex test', () => {
    const request = {
      f: 'png', // Note: the correct key would be "fm"
      'fp-x': '0.5',
      'fp-y': '0.5',
      fit: 'crop',
      crop: 'focalpoint,top,left'
    };
    const validatedSchema = normalizeAndValidateSchema(getSchemaForQueryParams(request), request, imgixSchema.parameters);
    expect(validatedSchema['fp-x'].processedValue).toEqual(0.5);
    expect(validatedSchema['fp-y'].processedValue).toEqual(0.5);
    expect(validatedSchema['fit'].processedValue).toEqual('crop');
    expect(validatedSchema['crop'].processedValue).toEqual(['focalpoint', 'top', 'left']);

    expect(validatedSchema['fm'].processedValue).toBeUndefined();
    expect(validatedSchema['w'].processedValue).toBeUndefined();
    expect(validatedSchema['h'].processedValue).toBeUndefined();
  });

  it('should accept inputs for parameters with multiple modes', () => {
    // Width can be represented as a percentage or as a pixel value
    const request1: QueryStringParameters = {
      w: '0.5'
    }
    const request2: QueryStringParameters = {
      w: '500'
    }
    // This should not be allowed
    const request3: QueryStringParameters = {
      w: 'foo'
    }
    const validatedSchema1 = normalizeAndValidateSchema(getSchemaForQueryParams(request1), request1, imgixSchema.parameters)
    const validatedSchema2 = normalizeAndValidateSchema(getSchemaForQueryParams(request2), request2, imgixSchema.parameters)
    expect(validatedSchema1.w.processedValue).toEqual(0.5);
    expect(validatedSchema2.w.processedValue).toEqual(500);
    expect(() => {
      normalizeAndValidateSchema(getSchemaForQueryParams(request3), request3, imgixSchema.parameters)
    }).toThrow();
  });

  test('Double mode -  int', () => {
    const request = {
      w: '100'
    };
    const schema = getSchemaForQueryParams(request);

    expect(() => normalizeAndValidateSchema(schema, request, imgixSchema.parameters)).not.toThrow();
  });

  test('Max range normalization', () => {
    const request = {
      dpr: '100'
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request, imgixSchema.parameters);

    expect(validatedSchema.dpr.processedValue).toEqual(5);
  });

  test('Min range normalization', () => {
    const request = {
      dpr: '-1'
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request, imgixSchema.parameters);

    expect(validatedSchema.dpr.processedValue).toEqual(0);
  });

  test('Null value normalization', () => {
    // This is to handle urls like this: image.jpg?sharp
    // Should use default value if one exists
    const request = {
      sharp: ''
    };
    const schema = getSchemaForQueryParams(request);
    const validatedSchema = normalizeAndValidateSchema(schema, request, imgixSchema.parameters);

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
      w: { ...imgixSchema.parameters.w, default: 100 },
      'fp-x': {
        ...imgixSchema.parameters['fp-x'],
        expects: [{ default: 0.5, type: ExpectedValueType.UnitScalar, strict_range: { min: 0, max: 1 } }]
      }
    };
    const original: EditsSubset = {};
    const expected = {
      w: { processedValue: 100, implicit: true, parameterDefinition: testSchema.w },
      'fp-x': { processedValue: 0.5, implicit: true, parameterDefinition: testSchema['fp-x'] }
    };
    expect(processDefaults(original, testSchema)).toEqual(expected);
  });

  test('does not overwrite existing values', () => {
    const testSchema: ImgixParameters = {
      w: { ...imgixSchema.parameters.w, default: 100 },
      bg: { ...imgixSchema.parameters.bg, expects: [{ default: '#fff', type: ExpectedValueType.String }] }
    };
    const original: EditsSubset = {
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

