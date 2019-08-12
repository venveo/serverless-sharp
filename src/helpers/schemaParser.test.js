const schemaParser = require('./schemaParser')
const ExpectationTypeException = require('../errors/ExpectationTypeException')

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
  test('Test invalid', () => {
    const request = {
      f: 'png',
      'fp-x': '0.5',
      fit: 'crop',
      q: 75 // q can't be used with png - this should be dropped
    }
    const schema = schemaParser.getSchemaForQueryParams(request)

    expect(() => {
      schemaParser.normalizeAndValidateSchema(schema, request)
    }).not.toThrow(ExpectationTypeException)
  })

  test('Test valid', () => {
    const request = {
      f: 'png',
      'fp-x': '0.5',
      'fp-y': '0.5',
      fit: 'crop',
      crop: 'focalpoint'
    }
    const schema = schemaParser.getSchemaForQueryParams(request)

    expect(() => schemaParser.normalizeAndValidateSchema(schema, request)).not.toThrow(ExpectationTypeException)
  })

  // Two mode test
  test('Test - double mode', () => {
    const request = {
      w: 0.4
    }
    const schema = schemaParser.getSchemaForQueryParams(request)

    expect(() => schemaParser.normalizeAndValidateSchema(schema, request)).not.toThrow(ExpectationTypeException)
  })

  test('Test - double mode - part 2', () => {
    const request = {
      w: 100
    }
    const schema = schemaParser.getSchemaForQueryParams(request)

    expect(() => schemaParser.normalizeAndValidateSchema(schema, request)).not.toThrow(ExpectationTypeException)
  })
})
