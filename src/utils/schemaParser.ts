import ExpectationTypeException from "../errors/ExpectationTypeException";
import {ParsedSchemaItem, QueryStringParameters, ParameterTypesSchema} from "../types/common";
import {ExpectedValueDefinition, Imgix, ParameterType} from "../types/imgix";
import {processInputValue} from "./inputValueProcessor";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema: Imgix = require('../../data/schema')

/**
 * Replaces any aliased keys with its base key
 * @param queryParameters
 */
export function replaceAliases(queryParameters: QueryStringParameters = {}): QueryStringParameters {
  const aliases = schema.aliases
  const noAliasQueryParams = Object.assign({}, queryParameters)
  // Iterate over aliases
  Object.keys(aliases).forEach((alias) => {
    // If the alias is used...
    if (noAliasQueryParams[alias] !== undefined) {
      // Set the canonical name for the alias as the alias' value
      // NOTE: This means an alias takes precedence over the canonical. Do we want that? idk.
      noAliasQueryParams[aliases[alias]] = noAliasQueryParams[alias]
      // Delete the alias key
      delete noAliasQueryParams[alias]
    }
  })
  return noAliasQueryParams
}

/**
 * Gets all of the valid schema parameters from an object, indexed by the parameter type
 * @param queryParameters
 */
export function getSchemaForQueryParams(queryParameters: QueryStringParameters = {}): ParameterTypesSchema {
  const params = schema.parameters
  const result: { [key: string]: ParameterType } = {}

  Object.keys(queryParameters).forEach((val: string) => {
    // Note: we're skipping over query params without a value - we'll assume these just use default values.
    if (queryParameters[val] && params[val] !== undefined) {
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
export function normalizeAndValidateSchema(schema: ParameterTypesSchema, values: QueryStringParameters = {}) {
  // Keeps a list of dependencies for each schema item
  const dependenciesByParameterIndex: { [key: string]: string[] } = {}
  let expectationValues: { [key: string]: ParsedSchemaItem } = {}

  Object.keys(schema).forEach((parameterIndex) => {
    // Keep track of dependencies we need to verify later
    if (schema[parameterIndex].depends !== undefined) {
      const currentDeps = schema[parameterIndex].depends ?? []
      const possibleValues = []
      for (const value of currentDeps) {
        possibleValues.push(value)
      }
      dependenciesByParameterIndex[parameterIndex] = possibleValues
    }

    // Check the expectations for each item. Note, each item can have multiple valid expectations.
    if (schema[parameterIndex].expects !== undefined) {
      let passedExpectation = null
      let result: ParsedSchemaItem | null = null
      for (let i = 0, len = schema[parameterIndex].expects.length; i < len; i++) {
        if (passedExpectation) {
          continue
        }

        result = processInputValueExpectation(schema[parameterIndex].expects[i], values[parameterIndex])
        if (result.passed) {
          passedExpectation = schema[parameterIndex].expects[i]
        }
      }
      if (!passedExpectation || !result) {
        throw new ExpectationTypeException('Did not pass expectations')
      }
      expectationValues[parameterIndex] = {
        processedValue: result.processedValue,
        passed: result.passed,
        implicit: result.implicit,
        schema: schema[parameterIndex],
        expectation: passedExpectation
      }
    }
  })

  // Go back and validate our dependencies now that we've looked at each item
  expectationValues = processDefaults(expectationValues)
  expectationValues = processDependencies(dependenciesByParameterIndex, expectationValues)

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
export function processDefaults(expectationValues: { [key: string]: ParsedSchemaItem }) {
  const fullSchemaParameters = schema.parameters
  Object.keys(fullSchemaParameters).forEach((val) => {
    if (expectationValues[val] === undefined) {
      // Handle when a default value is available on a schema
      if (fullSchemaParameters[val].default !== undefined) {
        expectationValues[val] = {
          processedValue: fullSchemaParameters[val].default,
          passed: true,
          implicit: true,
          schema: fullSchemaParameters[val],
        }
        // Apparently, expectations can have defaults as well?? We'll handle that here
      } else if (fullSchemaParameters[val].expects !== undefined && fullSchemaParameters[val].expects.length) {
        for (const expectation of fullSchemaParameters[val].expects) {
          if (expectation.default !== undefined) {
            expectationValues[val] = {
              processedValue: expectation.default,
              passed: true,
              implicit: true,
              schema: fullSchemaParameters[val],
            }
            break
          }
        }
        // There was no expectation, so go ahead and pass it as null
        if (expectationValues[val] === undefined) {
          expectationValues[val] = {
            processedValue: undefined,
            passed: true,
            implicit: true,
            schema: fullSchemaParameters[val],
          }
        }
      } else {
        // Otherwise, there's no value!
        expectationValues[val] = {
          processedValue: undefined,
          passed: true,
          implicit: true,
          schema: fullSchemaParameters[val],
        }
      }
    }
  })
  return expectationValues
}

/**
 * Processes an array of dependencies. A dependency can be like "sharp" or "crop=fit"
 */
export function processDependencies(dependencies: { [key: string]: string[] }, expectationValues: { [key: string]: ParsedSchemaItem }) {
  const passedDependencies: { [key: string]: string[] | boolean } = {}
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
        } else if (Array.isArray(expectationValues[key].processedValue) && (expectationValues[key].processedValue as Array<string | number>).includes(val)) {
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
 */
export function processInputValueExpectation(expects: ExpectedValueDefinition, value: string): ParsedSchemaItem {
  const processedValue = processInputValue(expects.type, value, expects)
  return {
    passed: processedValue.passed,
    implicit: false,
    processedValue: processedValue.processedValue,
    message: processedValue.message
  }
}
