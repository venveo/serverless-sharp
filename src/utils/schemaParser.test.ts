/* eslint-env jest */
import * as schemaParser from './schemaParser'

test('replaceAliases - compare objects', () => {
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

describe('Tests for schema validation', () => {
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
    }).not.toThrowError()
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
    expect(validatedSchema.q.passed).toEqual(true)
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

    expect(() => schemaParser.normalizeAndValidateSchema(schema, request)).not.toThrowError()
  })

  // Two mode test
  test('Double mode - ratio', () => {
    const request = {
      w: '0.4'
    }
    const schema = schemaParser.getSchemaForQueryParams(request)

    expect(() => schemaParser.normalizeAndValidateSchema(schema, request)).not.toThrowError()
  })

  test('Double mode -  int', () => {
    const request = {
      w: '100'
    }
    const schema = schemaParser.getSchemaForQueryParams(request)

    expect(() => schemaParser.normalizeAndValidateSchema(schema, request)).not.toThrowError()
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
    // This is to handle a url like this: image.jpg?sharp
    // Should use default value if one exists
    const request = {
      sharp: ''
    }
    const schema = schemaParser.getSchemaForQueryParams(request)
    const validatedSchema = schemaParser.normalizeAndValidateSchema(schema, request)

    expect(validatedSchema.sharp.processedValue).toEqual(0)
  })
})
