const schema = require('../../data/schema')
const ExpectationTypeException = require('../errors/ExpectationTypeException')

/**
 * Replaces any aliased keys with its base key
 * @param queryParameters
 */
exports.replaceAliases = (queryParameters = {}) => {
  const aliases = schema.aliases
  Object.keys(aliases).forEach((val) => {
    if (queryParameters[val] !== undefined) {
      Object.defineProperty(queryParameters, aliases[val],
        Object.getOwnPropertyDescriptor(queryParameters, val))
      delete queryParameters[val]
    }
  })
  return queryParameters
}

/**
 * Gets all of the valid schema parameters in an object
 * @param queryParameters
 */
exports.getSchemaForQueryParams = (queryParameters = {}) => {
  const params = schema.parameters
  const result = {}

  Object.keys(queryParameters).forEach((val) => {
    if (params[val] !== undefined) {
      result[val] = params[val]
    }
  })
  return result
}

/**
 *
 * @param {Object} schema
 * @param {Object} values
 * @return {Object}
 */
exports.normalizeAndValidateSchema = (schema = {}, values = {}) => {
  let dependencies = {}
  let expectationValues = {}

  Object.keys(schema).forEach((val) => {
    // Keep track of dependencies we need to verify later
    if (schema[val].depends !== undefined) {
      const currentDeps = schema[val].depends
      for (const value of currentDeps) {
        dependencies[value] = false
      }
    }

    // Check the expectations for each item. Note, each item can have multiple valid expectations.
    if (schema[val].expects !== undefined) {
      let passedExpectation = null
      let result = null
      for (let i = 0, len = schema[val].expects.length; i < len; i++) {
        if (passedExpectation) {
          continue
        }

        result = this.processExpectation(schema[val].expects[i], values[val])
        if (result.passed) {
          passedExpectation = schema[val].expects[i]
        }
      }
      if (!passedExpectation) {
        throw new ExpectationTypeException('Did not pass expectations')
      }
      expectationValues[val] = {
        value: result,
        expectation: passedExpectation,
        schema: schema[val]
      }
    }
  })

  // Go back and validate our dependencies now that we've looked at each item. Throw an exception if not met
  expectationValues = this.processDefaults(expectationValues)
  dependencies = Object.keys(dependencies)
  this.processDependencies(dependencies, expectationValues)

  // Now we'll merge the rest of the schema's defaults
  return expectationValues
}

/**
 * @param {Object} expectationValues
 * @param {Object} expectationValues.value
 * @param {Object} expectationValues.expectation
 * @param {Object} expectationValues.schema
 * @return {Object}
 */
exports.processDefaults = (expectationValues) => {
  const fullSchema = require('../../data/schema').parameters
  Object.keys(fullSchema).forEach((val) => {
    if (expectationValues[val] === undefined) {
      if (fullSchema[val]['default'] !== undefined) {
        expectationValues[val] = {
          value: {
            processedValue: fullSchema[val]['default'],
            passed: true,
            implicit: true
          },
          schema: fullSchema[val]
        }
      } else {
        expectationValues[val] = {
          value: {
            processedValue: null,
            passed: true,
            implicit: true
          },
          schema: fullSchema[val]
        }
      }
    }
  })
  return expectationValues
}

/**
 * Processes an array of dependencies. A dependency can be like "sharp" or "crop=fit"
 * @param dependencies
 * @param schema
 * @param values
 */
exports.processDependencies = (dependencies, expectationValues) => {
  dependencies.forEach((dependency) => {
    if (dependency.indexOf('=') !== -1) {
      const split = dependency.split('=')
      const key = split[0]
      const val = split[1]
      if (expectationValues[key] === undefined) {
        throw new ExpectationTypeException('Dependency not met: ' + dependency)
      }
      if (Array.isArray(expectationValues[key].value.processedValue)) {
        if (!expectationValues[key].value.processedValue.includes(val)) {
          throw new ExpectationTypeException('Dependency not met: ' + dependency)
        }
      } else if (expectationValues[key].value.processedValue !== val) {
        throw new ExpectationTypeException('Dependency not met: ' + dependency)
      }
    } else {
      if (expectationValues[dependency] === undefined) {
        throw new ExpectationTypeException('Dependency not met: ' + dependency)
      }
    }
  })
}

/**
 * Processes the expectations for certain parameters
 * @param expects
 * @param value
 * @returns {Object}
 */
exports.processExpectation = (expects = {}, value) => {
  const result = {
    passed: false,
    processedValue: null,
    message: null
  }

  // TODO: Break this out
  switch (expects['type']) {
    case 'string':
      if (value.length) {
        result.passed = true
        result.processedValue = value
      } else {
        result.message = 'String length expected'
      }
      return result
    case 'list':
      const items = value.split(',')
      if (!items.length) {
        result.message = 'At least one item expected'
        return result
      }
      if (expects['possible_values'] !== undefined) {
        const difference = items.filter(x => !expects['possible_values'].includes(x))
        if (difference.length > 0) {
          // Unexpected value encountered
          result.message = 'Invalid value encountered. Expected one of: ' + expects['possible_values'].join(',')
          return result
        }
      }
      result.processedValue = items
      result.passed = true
      return result
    case 'boolean':
      if (value === 'true' || value === true) {
        result.passed = true
        result.processedValue = true
      } else if (value === 'false' || value === false) {
        result.passed = true
        result.processedValue = false
      } else {
        result.message = 'Expected a boolean'
      }
      return result
    case 'ratio':
      if (!value.match(/([0-9]*[.]?[0-9]+):+([0-9]*[.])?[0-9]+$/)) {
        result.message = 'Expected ratio format: 1.0:1.0'
        return result
      }
      result.processedValue = value
      result.passed = true
      return result
    case 'integer':
      value = parseInt(value)
      if (isNaN(value)) {
        result.message = 'NaN'
        return result
      }
      result.processedValue = value

      if (expects['strict_range'] !== undefined) {
        if (value > expects['strict_range']['max'] || value < expects['strict_range']['min']) {
          result.message = 'Value out of range'
          return result
        }
      } else if (expects['possible_values'] !== undefined) {
        if (!expects['possible_values'].includes(value)) {
          result.message = 'Invalid value encountered. Expected one of: ' + expects['possible_values'].join(',')
          return result
        }
      }
      result.passed = true
      return result
    case 'number':
      value = parseFloat(value)
      if (isNaN(value)) {
        result.message = 'NaN'
        return result
      }
      if (expects['strict_range'] !== undefined) {
        if (value < expects['strict_range']['min'] || value > expects['strict_range']['max']) {
          result.message = 'Value out of range: ' + value
          return result
        }
      }
      result.passed = true
      return result
    case 'hex_color':
      if (!value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
        result.message = 'Expected hex code like #fff'
        return result
      }
      result.passed = true
      result.processedValue = value
      return result
    case 'color_keyword':
      if (!schema.colorKeywordValues.includes(value)) {
        result.message = 'Expected valid color name'
        return result
      }

      result.passed = true
      result.processedValue = value
      return result
    case 'unit_scalar':
      value = parseFloat(value)
      if (isNaN(value)) {
        result.message = 'NaN'
        return result
      }
      result.processedValue = value
      if (expects['strict_range'] !== undefined) {
        if (value < expects['strict_range']['min'] || value > expects['strict_range']['max']) {
          result.message = 'Value out of range'
          return result
        }
      }
      result.passed = true
      return result
    case 'timestamp':
      if (!(new Date(value)).getTime() > 0) {
        result.message = 'Expected valid unix timestamp'
        return result
      }
      result.processedValue = value
      result.passed = true
      return result
    case 'url':
      if (!value.match(/^(http|https):\/\/[^ "]+$/)) {
        result.message = 'Expected valid URL'
        return result
      }
      result.processedValue = value
      result.passed = true
      return result
    case 'path':
      // TODO:
      result.processedValue = value
      result.passed = true
      return result
    // throw new ExpectationTypeException;
    default:
      console.error('Encountered unknown expectation type: ' + expects['type'])
      break
  }
}
