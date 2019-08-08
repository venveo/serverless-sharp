const schema = require('../data/schema');
const ExpectationTypeException = require('../errors/ExpectationTypeException');

/**
 * Replaces any aliased keys with its base key
 * @param queryParameters
 */
exports.replaceAliases = (queryParameters = {}) => {
    const aliases = schema.aliases;
    Object.keys(aliases).forEach((val) => {
        if (queryParameters[val] !== undefined) {
            Object.defineProperty(queryParameters, aliases[val],
                Object.getOwnPropertyDescriptor(queryParameters, val));
            delete queryParameters[val];
        }
    });
    return queryParameters;
};

/**
 * Gets all of the valid schema parameters in an object
 * @param queryParameters
 */
exports.getSchemaForQueryParams = (queryParameters = {}) => {
    const params = schema.parameters;
    const result = {};

    Object.keys(queryParameters).forEach((val) => {
        if (params[val] !== undefined) {
            result[val] = params[val];
        }
    });
    return result;
};

/**
 *
 * @param schema
 * @param values
 */
exports.normalizeAndValidateSchema = (schema = {}, values = {}) => {
    let dependencies = {};

    Object.keys(schema).forEach((val) => {
        if (schema[val].depends !== undefined) {
            const currentDeps = schema[val].depends;
            for (const value of currentDeps) {
                dependencies[value] = false;
            }
        }
        if (schema[val].expects !== undefined) {
            for (let i = 0, len = schema[val].expects.length; i < len; i++) {
                values[val] = this.processExpectation(schema[val].expects[i], values[val])
            }
        }
    });

    dependencies = Object.keys(dependencies);
    this.processDependencies(dependencies, schema, values);
    return values;
};

exports.processDependencies = (dependencies, schema, values) => {
    dependencies.forEach((dependency) => {
        if (dependency.indexOf('=') !== -1) {
            const split = dependency.split('=');
            const key = split[0];
            const val = split[1];
            if (values[key] === undefined) {
                throw new ExpectationTypeException('Dependency not met: ' + dependency);
            }
            if (Array.isArray(values[key])) {
                if (!values[key].includes(val)) {
                    throw new ExpectationTypeException('Dependency not met: ' + dependency);
                }
            } else if (values[key] !== val) {
                throw new ExpectationTypeException('Dependency not met: ' + dependency);
            }
        } else {
            if (values[dependency] === undefined) {
                throw new ExpectationTypeException('Dependency not met: ' + dependency);
            }
        }
    });
};

/**
 * Processes the expectations for certain parameters
 * @param expects
 * @param value
 * @returns {string|boolean|[]|number}
 */
exports.processExpectation = (expects = {}, value) => {
    // TODO: Break this out
    switch(expects['type']) {
        case 'string':
            return value;
        case 'list':
            let items = value.split(',');
            if (expects['possible_values'] !== undefined) {
                let difference = items.filter(x => !expects['possible_values'].includes(x));
                if (difference.length > 0) {
                    // Unexpected value encountered
                    throw new ExpectationTypeException('Invalid value encountered. Expected one of: ' + expects['possible_values'].join(','));
                }
            }
            return items;
        case 'boolean':
            if (value === "true" || value === true) {
                return true;
            }
            if (value === "false" || value === false) {
                return false;
            }
            throw new ExpectationTypeException('Expected a boolean');
        case 'ratio':
            if(!value.match(/([0-9]*[.]?[0-9]+):+([0-9]*[.])?[0-9]+$/)) {
                throw new ExpectationTypeException('Expected ratio format: 1.0:1.0');
            }
            return value;
        case 'integer':
            value = parseInt(value);
            if (expects['strict_range'] !== undefined) {
                if (value > expects['strict_range']['max'] || value > expects['strict_range']['min']) {
                    throw new ExpectationTypeException('Value out of range');
                }
            } else if (expects['possible_values'] !== undefined) {
                if (!expects['possible_values'].includes(value)) {
                    throw new ExpectationTypeException('Invalid value encountered. Expected one of: ' + expects['possible_values'].join(','));
                }
            }
            return value;
        case 'number':
            value = parseFloat(value);
            if (expects['strict_range'] !== undefined) {
                if (value < expects['strict_range']['min'] || value > expects['strict_range']['max']) {
                    throw new ExpectationTypeException('Value out of range');
                }
            }
            return value;
        case 'hex_color':
            if (!value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
                throw new ExpectationTypeException('Expected hex code like #fff');
            }
            return value;
        case 'color_keyword':
            if (!schema.colorKeywordValues.includes(value)) {
                throw new ExpectationTypeException('Expected valid color name');
            }
            return value;
        case 'unit_scalar':
            if (expects['strict_range'] !== undefined) {
                if (value < expects['strict_range']['min'] || value > expects['strict_range']['max']) {
                    throw new ExpectationTypeException('Value out of range');
                }
            }
            return value;
        case 'timestamp':
            if (!(new Date(value)).getTime() > 0) {
                throw new ExpectationTypeException('Expected valid unix timestamp');
            }
            return value;
        case 'url':
            if (!value.match(/^(http|https):\/\/[^ "]+$/)) {
                throw new ExpectationTypeException('Expected valid URL');
            }
            return value;
        case 'path':
            // TODO:
            return value;
            // throw new ExpectationTypeException;
        default:
            console.error('Encountered unknown expectation type: ' + expects['type']);
            break;
    }
};
