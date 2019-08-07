const schema = require('../data/schema');

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
                values[val] = processExpectation(schema[val].expects[i], values[val])
            }
        }
    });
};

/**
 *
 * @param expects
 * @param value
 * @returns {string|boolean|[]}
 */
processExpectation = (expects = {}, value) => {
    switch(expects['type']) {
        case 'string':
            return value.toString();
        case 'list':
            break;
        case 'boolean':
            if (value === "true" || value === true) {
                return true;
            }
            if (value === "false" || value === false) {
                return false;
            }
            throw {};
        case 'ratio':
            if(!value.match(/([0-9]*[.]?[0-9]+)\:+([0-9]*[.])?[0-9]+$/)) {
                throw {};
            }
            return value.toString();
        case 'integer':
            break;
        case 'number':
            break;
        case 'hex_color':
            break;
        case 'color_keyword':
            break;
        case 'unit_scalar':
            break;
        case 'timestamp':
            break;
        case 'url':
            break;
        case 'path':
            break;
        default:
            console.error('Encountered unknown expectation type: ' + expects['type']);
            break;
    }
};
