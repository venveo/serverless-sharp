const eventParser = require('./eventParser');

/**
 *
 * @param path
 * @param queryStringParameters
 * @param hash
 * @returns {boolean}
 */
exports.verifyHash = (path, queryStringParameters, hash) => {
    const crypto = require('crypto');

    // Get the full query (minus the hash parameter)
    const query = eventParser.buildQueryStringFromObject(queryStringParameters);

    // Encode each part of the URI. (Note, we're not using URLencode on the entire thing, as it doesn't
    // properly handle "+" signs
    const encodedPath = decodeURIComponent(path).split('/').map((comp) => {
        return encodeURIComponent(comp)
    }).join('/');

    const source = process.env.SECURITY_KEY + encodedPath + query;
    const parsed = crypto.createHash('md5').update(source).digest("hex");
    return parsed === hash;
};
