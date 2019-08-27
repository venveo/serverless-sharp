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
  const encodedPath = decodeURIComponent(path).split('/').map((comp) => {
    return encodeURIComponent(comp)
  }).join('/')
  const source = process.env.SECURITY_KEY + encodedPath + query
  const parsed = crypto.createHash('md5').update(source).digest('hex')
  return parsed
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
