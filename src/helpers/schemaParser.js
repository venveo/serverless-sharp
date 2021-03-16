const schema = require('../../data/schema')
const ExpectationTypeException = require('../errors/ExpectationTypeException')
const ParsedSchemaItem = require('../helpers/ParsedSchemaItem')

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
  const dependencies = {}
  let expectationValues = {}

  Object.keys(schema).forEach((val) => {
    // Keep track of dependencies we need to verify later
    if (schema[val].depends !== undefined) {
      const currentDeps = schema[val].depends
      const possibleValues = []
      for (const value of currentDeps) {
        possibleValues.push(value)
      }
      dependencies[val] = possibleValues
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
      expectationValues[val] = new ParsedSchemaItem(
        result.processedValue,
        result.passed,
        result.implicit,
        schema[val],
        passedExpectation
      )
    }
  })

  // Go back and validate our dependencies now that we've looked at each item
  expectationValues = this.processDefaults(expectationValues)
  expectationValues = this.processDependencies(dependencies, expectationValues)

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
      // Handle when a default value is available on a schema
      if (fullSchema[val].default !== undefined) {
        expectationValues[val] = new ParsedSchemaItem(
          fullSchema[val].default,
          true,
          true,
          fullSchema[val],
          null
        )
        // Apparently, expectations can have defaults as well?? We'll handle that here
      } else if (fullSchema[val].expects !== undefined && fullSchema[val].expects.length) {
        for (const expectation of fullSchema[val].expects) {
          if (expectation.default !== undefined) {
            expectationValues[val] = new ParsedSchemaItem(
              expectation.default,
              true,
              true,
              fullSchema[val],
              null
            )
            break
          }
        }
        // There was no expectation, so go ahead and pass it as null
        if (expectationValues[val] === undefined) {
          expectationValues[val] = new ParsedSchemaItem(
            null,
            true,
            true,
            fullSchema[val],
            null
          )
        }
      } else {
        // Otherwise, there's no value!
        expectationValues[val] = new ParsedSchemaItem(
          null,
          true,
          true,
          fullSchema[val],
          null
        )
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
  const passedDependencies = {}
  Object.keys(dependencies).forEach((paramDependency) => {
    passedDependencies[paramDependency] = dependencies[paramDependency]
    for (const dependency of dependencies[paramDependency]) {
      // We have a dependency likes fm=png
      if (dependency.indexOf('=') !== -1) {
        const split = dependency.split('=')
        const key = split[0] // i.e. fm
        const val = split[1] // i.e. png

        // Required key not set - this should not happen
        if (expectationValues[key] === undefined) {
          throw new ExpectationTypeException('Important dependency not met: ' + dependency)

          // Our processed value is an array and it includes the value we're looking for! Winner!
        } else if (Array.isArray(expectationValues[key].processedValue) && expectationValues[key].processedValue.includes(val)) {
          passedDependencies[paramDependency] = true
          break

        // Expectation is equal! Winner!
        } else if (expectationValues[key].processedValue === val) {
          passedDependencies[paramDependency] = true
          break
        } else {
          // Womp - loser!
          continue
        }
      } else {
        // We just need to make sure this key exists
        if (expectationValues[dependency] !== undefined) {
          passedDependencies[paramDependency] = true
        }
      }
    }
  })

  // Moment of truth, did we meet our dependencies?
  Object.keys(passedDependencies).forEach((dep) => {
    if (passedDependencies[dep] !== true) {
      // If we don't meet a dependency, we'll remove the option so we can proceed semi-safely
      expectationValues[dep].implicit = true
      expectationValues[dep].passed = false
    }
  })

  return expectationValues
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
  let items, match

  // TODO: Break this out
  switch (expects.type) {
    case 'string':
      if (value.length) {
        result.passed = true
        result.processedValue = value
      } else {
        result.message = 'String length expected'
      }
      return result
    case 'list':
      items = value.split(',')
      if (!items.length) {
        result.message = 'At least one item expected'
        return result
      }
      if (expects.possible_values !== undefined) {
        const difference = items.filter(x => !expects.possible_values.includes(x))
        if (difference.length > 0) {
          // Unexpected value encountered
          result.message = 'Invalid value encountered. Expected one of: ' + expects.possible_values.join(',')
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
      match = value.match(/([0-9]*[.]?[0-9]+):+(([0-9]*[.])?[0-9]+)$/)
      if (match.length < 3) {
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
    case 'integer':
      value = parseInt(value)
      if (isNaN(value)) {
        result.message = 'NaN'
        return result
      }
      result.processedValue = value

      if (expects.strict_range !== undefined) {
        if (value > expects.strict_range.max || value < expects.strict_range.min) {
          result.message = 'Value out of range'
          return result
        }
      } else if (expects.possible_values !== undefined) {
        if (!expects.possible_values.includes(value)) {
          result.message = 'Invalid value encountered. Expected one of: ' + expects.possible_values.join(',')
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
      if (expects.strict_range !== undefined) {
        if (value < expects.strict_range.min) {
          value = expects.strict_range.min
        } else if (value > expects.strict_range.max) {
          value = expects.strict_range.max
        }
      }
      result.processedValue = value
      result.passed = true
      return result
    case 'hex_color':
      if (!value.match(/^(?:(?:[0-9a-fA-F]{4}){1,2})|(?:(?:[0-9a-fA-F]{3}){1,2})$/)) {
        result.message = 'Expected hex code like fff'
        return result
      }
      result.passed = true
      result.processedValue = '#' + value
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
      if (expects.strict_range !== undefined) {
        if (value < expects.strict_range.min || value > expects.strict_range.max) {
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
    case 'font':
      // TODO:
      result.processedValue = value
      result.passed = true
      return result
    // throw new ExpectationTypeException;
    default:
      console.error('Encountered unknown expectation type: ' + expects.type)
      break
  }
}
