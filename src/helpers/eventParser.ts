/**
 * Parses the name of the appropriate Amazon S3 key corresponding to the
 * original image.
 * @param uri
 * @param requiredPrefix
 */
export function parseImageKey(uri: string, requiredPrefix: string|null = null) {
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
 * @param queryStringParameters
 * @returns {string}
 * @private
 */
export function buildQueryStringFromObject(queryStringParameters: object) {
  let string = ''
  for (const [k, v] of Object.entries(queryStringParameters)) {
    // Don't hash the security token
    if (k !== 's') {
      string += '&' + k + '=' + encodeURIComponent(v)
    }
  }
  if (string.substr(1) === '') {
    return ''
  }
  return '?' + string.substr(1)
}

/**
 * Extracts the bucket and prefix from a string like,
 * mybucket/some-path/to-objects
 * @param fullPath
 * @returns {{bucket: null, prefix: string}}
 */
export function processSourceBucket(fullPath: string) {
  const result: { bucket: string|null; prefix: string|null } = {
    prefix: '',
    bucket: null
  }

  const parts = fullPath.split(/\/(.+)/)
  result.bucket = parts[0]
  result.prefix = parts[1]
  // TODO: Clean this up
  if (result.prefix === undefined) {
    result.prefix = null
  }
  return result
}

/**
 * Parses headers from an event and retrieves special compatibility cases for modern image types
 * @return {string[]}
 */
export function getAcceptedImageFormatsFromHeaders(headers: any) {
  if (headers.Accept === undefined || !headers.Accept) {
    return [];
  }
  const specialFormats: { [index: string]: string } = {
    'image/avif': 'avif',
    'image/apng': 'apng',
    'image/webp': 'webp'
  }
  return headers.Accept.toLowerCase()
    .split(',')
    .map((mime: string) => {
      return specialFormats[mime] ?? null
    })
    .filter((e: any) => e !== null)
}
