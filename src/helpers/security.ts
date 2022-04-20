import {buildQueryStringFromObject} from './eventParser';
import {getSetting} from "./settings";

/**
 * Computes a hash based on the path, query string params
 */
export function calculateHash(path: string, queryStringParameters: object, securityKey: string): string {
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
 */
function fixedEncodeURIComponent (str: string): string {
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
 */
export function verifyHash(path: string, queryStringParameters: object, hash: string): boolean {
  const parsed = calculateHash(path, queryStringParameters, getSetting('SECURITY_KEY'))
  return parsed.toLowerCase() === hash.toLowerCase()
}

/**
 * Returns true if the request should be 404'd immediately
 * @param path
 * @return {boolean}
 */
export function shouldSkipRequest(path: string): boolean {
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
