import {buildQueryStringFromObject} from './httpRequestProcessor';
import {getSetting} from "./settings";

import crypto from "crypto";
import {QueryStringParameters} from "../types/common";

/**
 * Computes a hash based on the path, query string params
 */
export function calculateHash(path: string, queryStringParameters: QueryStringParameters, securityKey: string): string {
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
function fixedEncodeURIComponent(str: string): string {
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
export function verifyHash(path: string, queryStringParameters: QueryStringParameters, hash: string): boolean {
  const parsed = calculateHash(path, queryStringParameters, getSetting('SECURITY_KEY'))
  return parsed.toLowerCase() === hash.toLowerCase()
}

/**
 * Returns true if the request should be 404'd immediately
 * @param path
 */
export function shouldSkipRequest(path: string): boolean {
  // Check if the file is explicitly ignored
  const filesToIgnore = getSetting('SLS_IGNORE')
  if (filesToIgnore && pathIsIgnored(path, filesToIgnore)) {
    return true;
  }

  // Check if there is a Regular Expression we need to validate against the path
  const validPathRegex: RegExp|null = getSetting('SLS_VALID_PATH_REGEX');
  // Check if the path matches our regex pattern
  if (validPathRegex && !pathMatchesRegex(path, validPathRegex)) {
    return true
  }

  return false
}

export function pathIsIgnored(path: string, filesToIgnore: string[]): boolean {
  // Remove the starting slash and check if the file should be ignored
  return !!filesToIgnore.includes(path.substring(1));
}

export function pathMatchesRegex(path: string, regex: RegExp): boolean {
  return regex.test(path);
}

