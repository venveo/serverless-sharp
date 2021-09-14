/**
 * Parses the name of the appropriate Amazon S3 key corresponding to the
 * original image.
 * @param uri
 * @param requiredPrefix
 */
exports.parseImageKey = (uri, requiredPrefix = null) => {
  // Decode the image request and return the image key
  // Ensure the path starts with our prefix
  let key = decodeURI(uri)
  if (key.startsWith('/')) {
    key = key.substr(1)
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
exports.buildQueryStringFromObject = (queryStringParameters) => {
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
exports.processSourceBucket = (fullPath) => {
  const result = {
    prefix: '',
    bucket: null
  }

  const parts = fullPath.split(/\/(.+)/)
  result.bucket = parts[0]
  result.prefix = parts[1]
  if (result.prefix === undefined) {
    result.prefix = ''
  }
  return result
}

/**
 * Parses headers from an event and retrieves special compatibility cases for modern image types
 * @param {string} headers
 * @return {string[]}
 */
exports.getAcceptedImageFormatsFromHeaders = (headers) => {
  if (headers.Accept === undefined || !headers.Accept) {
    return [];
  }
  const specialFormats = {
    'image/avif': 'avif',
    'image/apng': 'apng',
    'image/webp': 'webp'
  }
  return headers.Accept.toLowerCase()
    .split(',')
    .map((mime) => {
      return specialFormats[mime] ?? null
    })
    .filter((e) => e !== null)
}
