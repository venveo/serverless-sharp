import {
  QueryStringParameters,
  ParsedEdits, ParsedSchemaItem
} from '../types/common';
import { ImgixParameters, ParameterDefinition } from '../types/imgix';
import { processInputValue } from './inputValueProcessor';
import createHttpError from 'http-errors';

import { err, ok, Result } from 'neverthrow';
import { schema } from './schema';

/**
 * Creates a new QueryStringParameters object with any alias keys replaced with canonical parameters.
 * @param queryParameters - input object with keys being image operations
 */
export function replaceAliases(queryParameters: QueryStringParameters = {}): QueryStringParameters {
  const aliases = schema.aliases;
  // Make a copy of the original query parameters
  const noAliasQueryParams = { ...queryParameters };
  // Iterate over aliases
  for (const [alias, canonical] of Object.entries(aliases)) {
    // If the alias is used...
    if (alias in noAliasQueryParams) {
      // Set the canonical name for the alias as the alias' value
      // NOTE: This means an alias takes precedence over the canonical. Do we want that? idk.
      noAliasQueryParams[canonical] = noAliasQueryParams[alias];
      // Delete the alias key
      delete noAliasQueryParams[alias];
    }
  }
  return noAliasQueryParams;
}

/**
 * Gets all the valid schema parameters from an object, indexed by the parameter name (e.g. "w")
 * @param queryParameters - input query parameters object
 */
export function getSchemaForQueryParams(queryParameters: QueryStringParameters = {}): ImgixParameters {
  const allValidParameters = schema.parameters;
  const result: ImgixParameters = {};

  for (const qp in queryParameters) {
    // Note: we're skipping over query params without a value - we'll assume these just use default values.
    if (queryParameters[qp] && allValidParameters[qp] !== undefined) {
      result[qp] = allValidParameters[qp];
    }
  }
  return result;
}

/**
 * Determine what rule, if any, can be applied to the input value.
 * @param value - string input value
 * @param schemaItem - schema we're validating against
 */
export function determineSuccessfulValue(value: string, schemaItem: ParameterDefinition): Result<ParsedSchemaItem, string> {
  // Evaluate each of the expectations until we get a passing result.
  for (const expectation of schemaItem.expects) {
    const processedValue = processInputValue(value, expectation);
    if (processedValue.isOk()) {
      return ok({
        parameterDefinition: schemaItem,
        implicit: false,
        processedValue: processedValue.value
      });
    }
  }
  return err('Input value does not satisfy any expectations');
}

/**
 * @param inputSchema - schema containing only the items needed
 * @param values - query parameters object to validate
 */
export function normalizeAndValidateSchema(inputSchema: ImgixParameters, values: QueryStringParameters = {}): ParsedEdits {
  // Keeps a list of dependencies for each schema item
  const dependenciesByParameterIndex = new Map<string, string[]>();
  let parsedEdits: ParsedEdits = {};

  /**
   * This process collects operation dependencies into dependenciesByParameterIndex for evaluation later. For example,
   * "ar" depends on "fit" being set to "crop". Note, these dependencies don't always needs to be explicitly defined
   * in the query string, as they can be set as a default. Later on, we'll use these dependencies to see if defaults
   * are necessary and valid.
   */
  Object.keys(inputSchema).forEach((parameterIndex) => {
    const schemaItem = inputSchema[parameterIndex];
    const dependencies = schemaItem.depends;
    // Keep track of dependencies we need to verify later
    if (dependencies !== undefined) {
      dependenciesByParameterIndex.set(parameterIndex, dependencies);
    }

    /**
     * This process is all about ensuring the provided values in the query string are things we can work with. Certain
     * operations can expect lists of values or a number in a range. If at least one of these expectations isn't
     * satisfied, we need to throw an error.
     */
    const valueExpectations = schemaItem.expects ?? [];
    // Check the expectations for each item. Note, each item can have multiple valid expectations; however, only a
    // single valid option is required in order to pass.
    if (valueExpectations.length) {
      const passedExpectationResult = determineSuccessfulValue(values[parameterIndex], schemaItem);
      // There was no passing result - bail out!
      if (passedExpectationResult.isErr()) {
        // TODO: Return an err instead
        throw new createHttpError.BadRequest(`Expected parameter "${parameterIndex}" to satisfy one of: ${JSON.stringify(schemaItem.expects)}`);
      }

      parsedEdits[parameterIndex] = passedExpectationResult.value;
    }
  });

  // Add in our default values
  parsedEdits = processDefaults(parsedEdits);
  // Go back and validate our dependencies now that we've looked at each item
  parsedEdits = processDependencies(dependenciesByParameterIndex, parsedEdits);
  // Now we'll merge the rest of the schema's defaults
  return parsedEdits;
}

/**
 * Propagates any available default values from the schema to our edits.
 * @param original - input UnparsedEdits object
 */
export function processDefaults(original: ParsedEdits): ParsedEdits {
  const expectationValues: ParsedEdits = { ...original };
  const fullSchemaParameters = schema.parameters;
  // Iterate over each of the valid parameters from the full schema
  for (const [parameterKey, parameterSchema] of Object.entries(fullSchemaParameters)) {
    // The parameter was already present in the input, so we can skip it.
    if (expectationValues[parameterKey] !== undefined) {
      continue;
    }

    // Handle when a default value is available on a schema
    if (parameterSchema.default !== undefined) {
      expectationValues[parameterKey] = {
        processedValue: parameterSchema.default,
        implicit: true,
        parameterDefinition: parameterSchema
      };
      // Apparently, expectations can have defaults as well?? (See fp-x) We'll handle that here
    } else if (parameterSchema.expects !== undefined) {
      for (const expectation of parameterSchema.expects) {
        if (expectation.default !== undefined) {
          expectationValues[parameterKey] = {
            processedValue: expectation.default,
            implicit: true,
            parameterDefinition: parameterSchema
          };
          break;
        }
      }
      // There was no expectation, so go ahead and pass it as null
      if (expectationValues[parameterKey] === undefined) {
        expectationValues[parameterKey] = {
          processedValue: undefined,
          implicit: true,
          parameterDefinition: parameterSchema
        };
      }
    } else {
      // Otherwise, there's no value!
      expectationValues[parameterKey] = {
        processedValue: undefined,
        implicit: true,
        parameterDefinition: parameterSchema
      };
    }
  }
  return expectationValues;
}

/**
 * Processes an array of dependencies. A dependency can be like "sharp" or "crop=fit"
 */
export function processDependencies(dependencies: Map<string, string[]>, expectationValues: ParsedEdits): ParsedEdits {
  const passedDependencies: { [key: string]: string[] | boolean } = {};
  Object.keys(dependencies).forEach((paramDependency) => {
    passedDependencies[paramDependency] = dependencies[paramDependency];
    for (const dependency of dependencies[paramDependency]) {
      // We have a dependency likes fm=png
      if (dependency.indexOf('=') !== -1) {
        const split = dependency.split('=');
        const key = <keyof ParsedEdits>split[0]; // i.e. fm
        const val = <string>split[1]; // i.e. png

        const processedValue = expectationValues[key].processedValue;
        if (Array.isArray(processedValue) && (processedValue as Array<string | number>).includes(val)) {
          passedDependencies[paramDependency] = true;
          break;
        }
        if (processedValue === val) {
          passedDependencies[paramDependency] = true;
          break;
        }
      } else {
        // We just need to make sure this key exists
        if (expectationValues[dependency] !== undefined) {
          passedDependencies[paramDependency] = true;
        }
      }
    }
  });

  // Moment of truth, did we satisfy our dependencies?
  Object.keys(passedDependencies).forEach((dep) => {
    if (passedDependencies[dep] !== true) {
      // If we don't meet a dependency, we'll remove the option we can proceed semi-safely
      expectationValues[dep].implicit = true;
      expectationValues[dep].passed = false;
    }
  });

  return expectationValues;
}
