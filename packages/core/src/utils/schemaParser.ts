import {
  QueryStringParameters,
  ParameterTypesSchema,
  ParsedSchemaExpectation,
  ParsedEdits, UnparsedEdits
} from "../types/common";
import {ExpectedValueDefinition, Imgix} from "../types/imgix";
import {processInputValue} from "./inputValueProcessor";
import createHttpError from "http-errors";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema: Imgix = require('../../../../data/schema.json')

/**
 * Creates a new QueryStringParameters object with any alias keys replaced with canonical parameters.
 * @param queryParameters - input object with keys being image operations
 */
export function replaceAliases(queryParameters: QueryStringParameters = {}): QueryStringParameters {
  const aliases = schema.aliases
  // Make a copy of the original query parameters
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
 * Gets all the valid schema parameters from an object, indexed by the parameter name (e.g. "w")
 * @param queryParameters - input query paremters object
 */
export function getSchemaForQueryParams(queryParameters: QueryStringParameters = {}): ParameterTypesSchema {
  const params = schema.parameters
  const result: ParameterTypesSchema = {}

  Object.keys(queryParameters).forEach((qp: string) => {
    // Note: we're skipping over query params without a value - we'll assume these just use default values.
    if (queryParameters[qp] && params[qp] !== undefined) {
      result[qp] = params[qp]
    }
  })
  return result
}

/**
 * @param schema - input schema to validate against
 * @param values - query parameters object to validate
 */
export function normalizeAndValidateSchema(schema: ParameterTypesSchema, values: QueryStringParameters = {}): ParsedEdits {
  // Keeps a list of dependencies for each schema item
  const dependenciesByParameterIndex: { [key: string]: string[] } = {}
  let expectationValues: UnparsedEdits | ParsedEdits = {}

  /**
   * This process collects operation dependencies into dependenciesByParameterIndex for evaluation later. For example,
   * "ar" depends on "fit" being set to "crop". Note, these dependencies don't always needs to be explicitly defined
   * in the query string, as they can be set as a default. Later on, we'll use these dependencies to see if defaults
   * are necessary and valid.
   */
  Object.keys(schema).forEach((parameterIndex) => {
    const schemaItem = schema[parameterIndex]
    const dependencies = schemaItem.depends
    // Keep track of dependencies we need to verify later
    if (dependencies !== undefined) {
      dependenciesByParameterIndex[parameterIndex] = dependencies
    }

    /**
     * This process is all about ensuring the provided values in the query string are things we can work with. Certain
     * operations can expect lists of values or a number in a range. If at least one of these expectations isn't
     * satisfied, we need to throw an error.
     */
    const valueExpectations = schemaItem.expects
    // Check the expectations for each item. Note, each item can have multiple valid expectations; however, only a
    // single valid option is required in order to pass.
    if (valueExpectations !== undefined) {
      let passedExpectation: ExpectedValueDefinition | null = null
      let passedExpectationResult: ParsedSchemaExpectation | null = null
      // Evaluate each of the expectations until we get a passing result.
      for (const expectation of valueExpectations) {
        const inputValueDetails = processInputValue(expectation.type, values[parameterIndex], expectation)
        if (inputValueDetails.passed) {
          passedExpectationResult = {...inputValueDetails, implicit: false}
          passedExpectation = expectation
          break;
        }
      }
      // There was no passing result - bail out!
      if (!passedExpectation || !passedExpectationResult) {
        throw new createHttpError.BadRequest(`Expected parameter "${parameterIndex}" to satisfy: ${JSON.stringify(schemaItem.expects)}`)
      }

      expectationValues[parameterIndex] = {
        processedValue: passedExpectationResult.processedValue,
        passed: passedExpectationResult.passed,
        implicit: passedExpectationResult.implicit,
        schema: schemaItem
      }
    }
  })

  // Add in our default values
  expectationValues = processDefaults(expectationValues)
  // Go back and validate our dependencies now that we've looked at each item
  expectationValues = processDependencies(dependenciesByParameterIndex, <ParsedEdits>expectationValues)
  // Now we'll merge the rest of the schema's defaults
  return <ParsedEdits>expectationValues
}

/**
 * Propagates any available default values from the schema to our edits.
 * @param expectationValues - input UnparsedEdits object
 */
export function processDefaults(expectationValues: UnparsedEdits): ParsedEdits {
  const fullSchemaParameters = schema.parameters
  // Iterate over each of the valid parameters from the full schema
  for (const parameterKey of Object.keys(fullSchemaParameters)) {
    // The parameter was already present in the input, so we can skip it.
    if (expectationValues[parameterKey] !== undefined) {
      continue;
    }
    const parameterSchema = fullSchemaParameters[parameterKey];

    // Handle when a default value is available on a schema
    if (parameterSchema.default !== undefined) {
      expectationValues[parameterKey] = {
        processedValue: parameterSchema.default,
        passed: true,
        implicit: true,
        schema: parameterSchema,
      }
      // Apparently, expectations can have defaults as well?? (See fp-x) We'll handle that here
    } else if (parameterSchema.expects !== undefined) {
      for (const expectation of parameterSchema.expects) {
        if (expectation.default !== undefined) {
          expectationValues[parameterKey] = {
            processedValue: expectation.default,
            passed: true,
            implicit: true,
            schema: parameterSchema,
          }
          break;
        }
      }
      // There was no expectation, so go ahead and pass it as null
      if (expectationValues[parameterKey] === undefined) {
        expectationValues[parameterKey] = {
          processedValue: undefined,
          passed: true,
          implicit: true,
          schema: parameterSchema,
        }
      }
    } else {
      // Otherwise, there's no value!
      expectationValues[parameterKey] = {
        processedValue: undefined,
        passed: true,
        implicit: true,
        schema: parameterSchema,
      }
    }
  }
  return <ParsedEdits>expectationValues
}

/**
 * Processes an array of dependencies. A dependency can be like "sharp" or "crop=fit"
 */
export function processDependencies(dependencies: { [key: string]: string[] }, expectationValues: ParsedEdits): ParsedEdits {
  const passedDependencies: { [key: string]: string[] | boolean } = {}
  Object.keys(dependencies).forEach((paramDependency) => {
    passedDependencies[paramDependency] = dependencies[paramDependency]
    for (const dependency of dependencies[paramDependency]) {
      // We have a dependency likes fm=png
      if (dependency.indexOf('=') !== -1) {
        const split = dependency.split('=')
        const key = <keyof ParsedEdits>split[0] // i.e. fm
        const val = <string>split[1] // i.e. png

        const processedValue = expectationValues[key].processedValue
        if (Array.isArray(processedValue) && (processedValue as Array<string | number>).includes(val)) {
          passedDependencies[paramDependency] = true
          break;
        }
        if (processedValue === val) {
          passedDependencies[paramDependency] = true
          break
        }
      } else {
        // We just need to make sure this key exists
        if (expectationValues[dependency] !== undefined) {
          passedDependencies[paramDependency] = true
        }
      }
    }
  })

  // Moment of truth, did we satisfy our dependencies?
  Object.keys(passedDependencies).forEach((dep) => {
    if (passedDependencies[dep] !== true) {
      // If we don't meet a dependency, we'll remove the option we can proceed semi-safely
      expectationValues[dep].implicit = true
      expectationValues[dep].passed = false
    }
  })

  return expectationValues
}
