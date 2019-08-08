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
exports.processSchemaExpectations = (schema = {}, values = {}) => {
    let dependencies = [];

    Object.keys(schema).forEach((val) => {
        if (schema[val].depends !== undefined) {
            const currentDeps = schema[val].depends;
            dependencies = dependencies.concat(currentDeps);
        }
        if (schema[val].expects !== undefined) {
            for (let i = 0, len = schema[val].expects.length; i < len; i++) {
                values[val] = this.processExpectation(schema[val].expects[i], values[val])
            }
        }
    });

    console.log(values);
};

/**
 *
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
                    throw new ExpectationTypeException;
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
            throw new ExpectationTypeException;
        case 'ratio':
            if(!value.match(/([0-9]*[.]?[0-9]+):+([0-9]*[.])?[0-9]+$/)) {
                throw new ExpectationTypeException;
            }
            return value;
        case 'integer':
            value = parseInt(value);
            if (expects['strict_range'] !== undefined) {
                if (value >= expects['strict_range']['min'] && value <= expects['strict_range']['max']) {
                    return value;
                }
            } else if (expects['possible_values'] !== undefined) {
                if (expects['possible_values'].includes(value)) {
                    return value;
                }
            }
            throw new ExpectationTypeException;
        case 'number':
            value = parseFloat(value);
            if (expects['strict_range'] !== undefined) {
                if (value >= expects['strict_range']['min'] && value <= expects['strict_range']['max']) {
                    return value;
                }
            }
            throw new ExpectationTypeException;
        case 'hex_color':
            if (!value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
                throw new ExpectationTypeException;
            }
            return value;
        case 'color_keyword':
            if (!schema.colorKeywordValues.includes(value)) {
                throw new ExpectationTypeException;
            }
            return value;
        case 'unit_scalar':
            // TODO:
            throw new ExpectationTypeException;
        case 'timestamp':
            if (!(new Date(value)).getTime() > 0) {
                throw new ExpectationTypeException;
            }
            return value;
        case 'url':
            if (!value.match(/^(http|https):\/\/[^ "]+$/)) {
                throw new ExpectationTypeException;
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
