const eventParser = require('./eventParser')

/**
 * Computes a hash based on the path, query string params
 * @param {string} path
 * @param {Object} queryStringParameters
 * @param {string} securityKey
 * @return {string}
 */
exports.calculateHash = (path, queryStringParameters, securityKey) => {
  const crypto = require('crypto')

  // Get the full query (minus the hash parameter)
  const query = eventParser.buildQueryStringFromObject(queryStringParameters)

  // Encode each part of the URI. (Note, we're not using URLEncode on the entire thing, as it doesn't
  // properly handle "+" signs
  const encodedPath = fixedEncodeURIComponent(decodeURIComponent(path))
  const source = process.env.SECURITY_KEY + encodedPath + query
  const parsed = crypto.createHash('md5').update(source).digest('hex')
  return parsed
}

/**
 * RFC 3986 encodeURIComponent
 * @param str
 * @return {string}
 */
function fixedEncodeURIComponent (str) {
  return str.replace(/([^\w\-\/\:@])/gi, function (match) {
    return encodeURIComponent(match)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
  })
}

/**
 *
 * @param path
 * @param queryStringParameters
 * @param hash
 * @returns {boolean}
 */
exports.verifyHash = (path, queryStringParameters, hash) => {
  const parsed = this.calculateHash(path, queryStringParameters, hash, process.env.SECURITY_KEY)
  return parsed === hash
}

/**
 * Returns true if the request should be 404'd immediately
 * @param path
 * @return {boolean}
 */
exports.shouldSkipRequest = (event) => {
  const path = event.path
  if (!process.env.SLS_IGNORE) {
    return false
  }
  const filesToIgnore = process.env.SLS_IGNORE.split(',')
  if (filesToIgnore.includes(path.substr(1))) {
    return true
  }
  return false
}

/**
 * Returns true if the requested path is valid, otherwise false and should be 404'd immediately
 * @param event
 * @return {boolean}
 */
exports.isValidPath = (event) => {
  const path = event.path
  const validPathRegex = RegExp(process.env.VALID_PATH_REGEX)
  if (!validPathRegex.test(path)) {
    return false
  }
  return true
}
