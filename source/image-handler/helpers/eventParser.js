/**
 * Parses the name of the appropriate Amazon S3 key corresponding to the
 * original image.
 * @param {Object} event - Lambda request body.
 * @param requiredPrefix
 */
exports.parseImageKey = (event, requiredPrefix = null) => {
    // Decode the image request and return the image key
    // Ensure the path starts with our prefix
    let key = decodeURI(event["path"]);
    if (key.startsWith('/')) {
        key = key.substr(1);
    }

    if (requiredPrefix) {
        if (!key.startsWith(requiredPrefix)) {
            key = requiredPrefix + '/' + key;
        }
    }

    console.log(key);
    return key;
};

/**
 * Assembles an object of query params into a string for hashing
 * @param queryStringParameters
 * @returns {string}
 * @private
 */
exports.buildQueryStringFromObject = (queryStringParameters) => {
    let string = '';
    for (const [k, v] of Object.entries(queryStringParameters)) {
        // Don't hash the security token
        if (k !== 's') {
            string += '&' + k + '=' + encodeURIComponent(v);
        }
    }
    return '?' + string.substr(1);
};


/**
 * Extracts the bucket and prefix from a string like,
 * mybucket/some-path/to-objects
 * @param fullPath
 * @returns {{bucket: null, prefix: string}}
 */
exports.processSourceBucket = (fullPath) => {
    let result = {
        prefix: '',
        bucket: null
    };

    let parts = fullPath.split(/\/(.+)/);
    result.bucket = parts[0];
    result.prefix = parts[1];
    return result;
};
