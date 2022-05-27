import {QueryStringParameters, BucketDetails, GenericHeaders} from "../types/common";

/**
 * Extracts the name of the appropriate Amazon S3 object
 *
 * @param uri The URI from the request. Starting slashes will be removed automatically
 * @param requiredPrefix A prefix to prepend to the key. A trailing slash will be added automatically
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
 * @param queryStringParameters An object containing each of the query parameters and its value
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
 * Example:,
 *  bucket/some-path/to-objects
 * {name: 'bucket', prefix: 'some-path/to-objects'}
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
 * @return {string[]}
 */
export function getAcceptedImageFormatsFromHeaders(headers: GenericHeaders): string[] {
  if (headers === undefined || !headers.Accept) {
    return [];
  }
  const specialFormats: { [index: string]: string } = {
    'image/avif': 'avif',
    'image/apng': 'apng',
    'image/webp': 'webp'
  }
  return headers.Accept.toString().toLowerCase()
    .split(',')
    .map((mime: string) => {
      return specialFormats[mime] ?? null
    })
    .filter((e: any) => e !== null)
}
