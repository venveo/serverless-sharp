import {
  QueryStringParameters,
  BucketDetails,
  GenericHeaders,
  ImageExtension,
  ProcessedImageRequest
} from "../types/common";
import {getSetting} from "./settings";

/**
 * Extracts the name of the appropriate Amazon S3 object
 *
 * @param uri - The URI from the request. Starting slashes will be removed automatically
 * @param requiredPrefix - A prefix to prepend to the key. A trailing slash will be added automatically
 */
export function extractObjectKeyFromUri(uri: string, requiredPrefix: string | null = null): string {
  // Decode the image request and return the image key
  // Ensure the path starts with our prefix
  let key = decodeURI(uri)
  if (key.startsWith('/')) {
    key = key.substring(1)
  }

  if (requiredPrefix) {
    if (!key.startsWith(requiredPrefix)) {
      key = requiredPrefix + '/' + key
    }
  }
  return key
}

/**
 * Assembles an object of query params into a string for hashing. Removes `s` query param automatically
 *
 * @param queryStringParameters - An object containing each of the query parameters and its value
 */
export function buildQueryStringFromObject(queryStringParameters: QueryStringParameters): string {
  let string = ''
  for (const [k, v] of Object.entries(queryStringParameters)) {
    // Don't hash the security token
    if (k !== 's') {
      string += '&' + k + '=' + encodeURIComponent(v)
    }
  }
  if (string.substring(1) === '') {
    return ''
  }
  return '?' + string.substring(1)
}

/**
 * Extracts the name of a bucket and a path prefix, if defined
 *
 * Example:
 * ```
 *  bucket/some-path/to-objects
 * \{name: 'bucket', prefix: 'some-path/to-objects'\}
 * ```
 */
export function extractBucketNameAndPrefix(fullPath: string): BucketDetails {

  const parts = fullPath.split(/\/(.+)/)
  const name = parts[0]
  const prefix = parts[1] ?? null
  return {
    name,
    prefix
  }
}

/**
 * Parses headers from an event and retrieves special compatibility cases for modern image types
 */
export function getAcceptedImageFormatsFromHeaders(headers: GenericHeaders): string[] {
  if (!headers?.Accept) {
    return [];
  }
  const specialFormats: { [mimeType: string]: string } = {
    'image/avif': ImageExtension.AVIF,
    // 'image/apng': 'apng', // apng is not supported by Sharp yet
    'image/webp': ImageExtension.WEBP
  }
  return headers.Accept.toString().toLowerCase()
    .split(',')
    .map((mime: string) => {
      return specialFormats[mime] ?? null
    })
    .filter((e: string) => e !== null)
}


/**
 * Generates the appropriate set of response headers based on a successful optimization
 * @param processedRequest - A processed request object
 */
export function getResponseHeaders(processedRequest: ProcessedImageRequest): GenericHeaders {
  const timeNow = new Date()
  const headers: GenericHeaders = {
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Last-Modified': timeNow.toUTCString()
  }
  const cacheControlDefault = <string>getSetting('DEFAULT_CACHE_CONTROL')
  if (processedRequest.CacheControl) {
    headers['Cache-Control'] = processedRequest.CacheControl
  } else if (cacheControlDefault) {
    headers['Cache-Control'] = cacheControlDefault
  }
  headers['Content-Type'] = processedRequest.ContentType

  return headers
}