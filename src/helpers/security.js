import {buildQueryStringFromObject} from './eventParser';
import {getSetting} from "./settings";

/**
 * Computes a hash based on the path, query string params
 * @param {string} path
 * @param {Object} queryStringParameters
 * @param {string} securityKey
 * @return {string}
 */
export function calculateHash(path, queryStringParameters, securityKey) {
  const crypto = require('crypto')

  // Get the full query (minus the hash parameter)
  const query = buildQueryStringFromObject(queryStringParameters)

  // Encode each part of the URI. (Note, we're not using URLEncode on the entire thing, as it doesn't
  // properly handle "+" signs
  const encodedPath = fixedEncodeURIComponent(decodeURIComponent(path))
  const source = securityKey + encodedPath + query
  return crypto.createHash('md5').update(source).digest('hex')
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
export function verifyHash(path, queryStringParameters, hash) {
  const parsed = calculateHash(path, queryStringParameters, getSetting('SECURITY_KEY'))
  return parsed.toLowerCase() === hash.toLowerCase()
}

/**
 * Returns true if the request should be 404'd immediately
 * @param path
 * @return {boolean}
 */
export function shouldSkipRequest(path) {
  // Check if the file is explicitly ignored
  if (getSetting('SLS_IGNORE')) {
    const filesToIgnore = getSetting('SLS_IGNORE')
    // Remove the starting slash and check if the file should be ignored
    if (filesToIgnore.includes(path.substring(1))) {
      return true
    }
  }

  // Check if the path matches our regex pattern
  if (!getSetting('SLS_VALID_PATH_REGEX')) {
    return false
  }
  const validPathRegex = getSetting('SLS_VALID_PATH_REGEX')
  if (validPathRegex !== null) {
    return !validPathRegex.test(path)
  }
  return false;
}
