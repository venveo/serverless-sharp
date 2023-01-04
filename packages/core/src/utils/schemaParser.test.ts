/* eslint-env jest */
import * as schemaParser from './schemaParser';
import { AvailableIn, Category, ExpectedValueType, ParameterDefinition } from '../types/imgix';
import { ok } from 'neverthrow';
import { ParsedSchemaItem } from '../types/common';

describe('replaceAliases', () => {
  it('should not break invalid parameters', () => {
    const replaced = schemaParser.replaceAliases({
      f: 'asdf',
      m: 'asdff',
      'no-touch': 'foo',
      fit: 'hello' // This will get over-written
    })

    expect(replaced).toMatchObject({
      fit: 'asdf',
      mark: 'asdff',
      'no-touch': 'foo'
    })
  })
})

describe('getSchemaForQueryParams', () => {
  it('should return only valid parameter definitions', () => {
    const properties = schemaParser.getSchemaForQueryParams({
      fm: 'jpg',
      w: '1920',
      foo: 'invalid'
    })
    expect(Object.keys(properties)).toEqual(["fm", "w"]);
    expect(properties.fm.display_name).toEqual("output format");
    expect(properties.w.display_name).toEqual("image width");
  })
})

describe('normalizeAndValidateSchema', () => {
  test('Invalid combination: png & q', () => {
    const request = {
      fm: 'png',
      'fp-x': '0.5',
      fit: 'crop',
      q: '75' // q can't be used with png - this should be dropped
    }
    const schema = schemaParser.getSchemaForQueryParams(request)

    expect(() => {
      schemaParser.normalizeAndValidateSchema(schema, request)
    }).not.toThrow()
  })

  test('Valid with jpg', () => {
    const request = {
      q: '75',
      fm: 'jpg'
    }
    const schema = schemaParser.getSchemaForQueryParams(request)
    const validatedSchema = schemaParser.normalizeAndValidateSchema(schema, request)

    expect(validatedSchema.q.processedValue).toEqual(75)
    expect(validatedSchema.q.implicit).toEqual(false)
  })

  test('Valid', () => {
    const request = {
      f: 'png',
      'fp-x': '0.5',
      'fp-y': '0.5',
      fit: 'crop',
      crop: 'focalpoint'
    }
    const schema = schemaParser.getSchemaForQueryParams(request)

    expect(() => schemaParser.normalizeAndValidateSchema(schema, request)).not.toThrow()
  })

  // Two mode test
  test('Double mode - ratio', () => {
    const request = {
      w: '0.4'
    }
    const schema = schemaParser.getSchemaForQueryParams(request)

    expect(() => schemaParser.normalizeAndValidateSchema(schema, request)).not.toThrow()
  })

  test('Double mode -  int', () => {
    const request = {
      w: '100'
    }
    const schema = schemaParser.getSchemaForQueryParams(request)

    expect(() => schemaParser.normalizeAndValidateSchema(schema, request)).not.toThrow()
  })

  test('Max range normalization', () => {
    const request = {
      dpr: '100'
    }
    const schema = schemaParser.getSchemaForQueryParams(request)
    const validatedSchema = schemaParser.normalizeAndValidateSchema(schema, request)

    expect(validatedSchema.dpr.processedValue).toEqual(5)
  })

  test('Min range normalization', () => {
    const request = {
      dpr: '-1'
    }
    const schema = schemaParser.getSchemaForQueryParams(request)
    const validatedSchema = schemaParser.normalizeAndValidateSchema(schema, request)

    expect(validatedSchema.dpr.processedValue).toEqual(0)
  })

  test('Null value normalization', () => {
    // This is to handle urls like this: image.jpg?sharp
    // Should use default value if one exists
    const request = {
      sharp: ''
    }
    const schema = schemaParser.getSchemaForQueryParams(request)
    const validatedSchema = schemaParser.normalizeAndValidateSchema(schema, request)

    expect(validatedSchema.sharp.processedValue).toEqual(0)
  })
})

describe('determineSuccessfulValue', () => {
  describe('test with single rule', () => {
    const testSchemaItem: ParameterDefinition = {
      expects: [
        {
          type: ExpectedValueType.Number,
        }
      ],
      depends: [],
      display_name: "Test",
      available_in: [AvailableIn.URL],
      category: Category.ADJUSTMENT,
      short_description: "Just a test item"
    }

    it('should produce expected number', () => {
      const successfulResult: ParsedSchemaItem = {
        processedValue: 10,
        implicit: false,
        parameterDefinition: testSchemaItem
      }
      expect(schemaParser.determineSuccessfulValue('10', testSchemaItem)).toEqual(ok(successfulResult));
      expect(schemaParser.determineSuccessfulValue('10', testSchemaItem)).toHaveProperty('value');
      expect(schemaParser.determineSuccessfulValue('notanumber', testSchemaItem)).not.toHaveProperty('value');
    });
  });

  describe('test with multiple rules', () => {
    const testSchemaItem: ParameterDefinition = {
      expects: [
        {
          type: ExpectedValueType.Number,
        },
        {
          type: ExpectedValueType.Boolean
        }
      ],
      depends: [],
      display_name: "Test",
      available_in: [AvailableIn.URL],
      category: Category.ADJUSTMENT,
      short_description: "Just a test item"
    }

    it('should produce expected number or respect boolean', () => {
      const successfulResultNumeric: ParsedSchemaItem = {
        processedValue: 10,
        implicit: false,
        parameterDefinition: testSchemaItem
      }
      const successfulResultBooleanTrue: ParsedSchemaItem = {
        processedValue: true,
        implicit: false,
        parameterDefinition: testSchemaItem
      }
      const successfulResultBooleanFalse: ParsedSchemaItem = {
        processedValue: false,
        implicit: false,
        parameterDefinition: testSchemaItem
      }
      expect(schemaParser.determineSuccessfulValue('10', testSchemaItem)).toEqual(ok(successfulResultNumeric));
      expect(schemaParser.determineSuccessfulValue('true', testSchemaItem)).toEqual(ok(successfulResultBooleanTrue));
      expect(schemaParser.determineSuccessfulValue('false', testSchemaItem)).toEqual(ok(successfulResultBooleanFalse));
      expect(schemaParser.determineSuccessfulValue('notanumberorboolean', testSchemaItem)).not.toHaveProperty('value');
    });
  });

});