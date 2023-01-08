import {
  QueryStringParameters,
  ParsedEdits,
  ParsedSchemaItem, EditsSubset
} from '../types/common';
import { ImgixParameters, ParameterDefinition } from '../types/imgix';
import { processInputValue } from './input-value-processor';
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

type ParameterDependencies = Map<string, string[]>;

/**
 * @param inputSchema - schema containing only the items needed
 * @param values - query parameters object to validate
 * @param referenceParameters - input schema parameters
 */
export function normalizeAndValidateSchema(inputSchema: ImgixParameters, values: QueryStringParameters = {}, referenceParameters: ImgixParameters): Result<ParsedEdits,string> {
  // Keeps a list of dependencies for each schema item
  const dependenciesByParameterIndex: ParameterDependencies = new Map<string, string[]>();
  let parsedEdits: EditsSubset = {};

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
        return err(new createHttpError.BadRequest(`Expected parameter "${parameterIndex}" to satisfy one of: ${JSON.stringify(schemaItem.expects)}`))
      }

      parsedEdits[parameterIndex] = passedExpectationResult.value;
    }
  });

  // Add in our default values
  parsedEdits = processDefaults(parsedEdits as ParsedEdits, referenceParameters);
  // Go back and validate our dependencies now that we've looked at each item
  parsedEdits = processDependencies(dependenciesByParameterIndex, parsedEdits as ParsedEdits);
  // Now we'll merge the rest of the schema's defaults
  return ok(parsedEdits as ParsedEdits);
}

/**
 * Propagates any available default values from the schema to our edits.
 * @param original - input object
 * @param schemaParameters - full schema to process defaults from
 */
export function processDefaults(original: EditsSubset|ParsedEdits, schemaParameters: ImgixParameters): EditsSubset|ParsedEdits {
  // Clone the original object to avoid modifying it
  const expectationValues: typeof original = Object.assign({}, original);
  // Iterate over each of the valid parameters from the full schema
  for (const [parameterKey, parameterSchema] of Object.entries(schemaParameters)) {
    // The parameter was already present in the input, so we can skip it.
    if (expectationValues[parameterKey] !== undefined) {
      continue;
    }
    expectationValues[parameterKey] = {
      processedValue: undefined,
      implicit: true,
      parameterDefinition: parameterSchema
    };

    // Handle when a default value is available on a schema
    if (parameterSchema.default !== undefined) {
      expectationValues[parameterKey].processedValue = parameterSchema.default;
      continue;
    }
    // Apparently, expectations can have defaults as well?? (See fp-x) We'll handle that here
    if (parameterSchema.expects !== undefined) {
      for (const expectation of parameterSchema.expects) {
        if (expectation.default !== undefined) {
          expectationValues[parameterKey].processedValue = expectation.default;
          // Exit the inner loop early if a default value is found
          break;
        }
      }
    }
  }
  return expectationValues;
}

/**
 * Processes an array of dependencies. A dependency can be like "sharp" or "crop=fit"
 */
export function processDependencies(dependencies: ParameterDependencies, original: ParsedEdits|EditsSubset): ParsedEdits|EditsSubset {
  // Clone the original object to avoid modifying it
  const expectationValues = { ...original };

  const checkedDependencies = new Map<string, boolean>();

  for (const [paramDependencyKey, paramDependencyValues] of dependencies) {
    let dependenciesSatisfied = false;
    // At least one dependency must be met to proceed
    for (const dependency of paramDependencyValues) {
      if (dependency.indexOf('=') !== -1) {
        const split = dependency.split('=');
        const key = split[0] as keyof EditsSubset; // e.g. fm
        const val = split[1] as string; // e.g. png

        const processedValue = expectationValues[key]?.processedValue;
        if (processedValue === val) {
          dependenciesSatisfied = true
          break;
        }
        // NOTE: I couldn't come up with a real-world case for this, but I'm too scared to remove it.
        // Add a test case if you figure it out!
        if (Array.isArray(processedValue) && (processedValue as Array<string | number>).includes(val)) {
          dependenciesSatisfied = true
          break;
        }
      } else {
        // We just need to make sure this key exists - the exact value doesn't matter
        if (expectationValues[dependency]?.processedValue !== undefined) {
          dependenciesSatisfied = true
        }
      }
    }
    checkedDependencies.set(paramDependencyKey, dependenciesSatisfied)
  }

  // Moment of truth, did we satisfy our dependencies?
  for (const [dependencyKey, dependencySatisfied] of checkedDependencies) {
    if (!dependencySatisfied) {
      // If we don't meet a dependency, we'll remove the option we can proceed semi-safely
      expectationValues[dependencyKey].implicit = true;
      expectationValues[dependencyKey].processedValue = undefined;
    }
  }
  return expectationValues;
}
