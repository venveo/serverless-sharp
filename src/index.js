const ImageRequest = require('./ImageRequest.js')
const ImageHandler = require('./ImageHandler.js')
const security = require('./helpers/security')
const settings = require('./helpers/settings')

exports.handler = async (event, context, callback) => {
  // console.log('EVENT\n' + JSON.stringify(event, null, 2))
  const beforeHandle = beforeHandleRequest(event)

  if (!beforeHandle.allowed) {
    context.succeed(beforeHandle.response)
    return
  }

  try {
    const imageRequest = new ImageRequest(event)
    await imageRequest.process() // This is important! We need to load the metadata off the image and check the format
    const imageHandler = new ImageHandler(imageRequest)

    const processedRequest = await imageHandler.process()

    const response = {
      statusCode: 200,
      headers: getResponseHeaders(processedRequest, null),
      body: processedRequest.Body,
      isBase64Encoded: true
    }
    context.succeed(response)
  } catch (err) {
    const response = {
      statusCode: err.status,
      headers: getResponseHeaders(null, true),
      body: JSON.stringify(err),
      isBase64Encoded: false
    }
    context.succeed(response)
  }
}

/**
 * Generates the appropriate set of response headers based on a success
 * or error condition.
 * @param processedRequest
 * @param {boolean} isErr - has an error been thrown?
 */
const getResponseHeaders = (processedRequest, isErr) => {
  const timenow = new Date()
  const headers = {
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': true,
    'Last-Modified': timenow.toString()
  }
  const cacheControlDefault = settings.getSetting('DEFAULT_CACHE_CONTROL')
  if (processedRequest) {
    if ('CacheControl' in processedRequest && processedRequest.CacheControl !== undefined) {
      headers['Cache-Control'] = processedRequest.CacheControl
    } else if (cacheControlDefault) {
      headers['Cache-Control'] = cacheControlDefault
    }
    if ('ContentType' in processedRequest) {
      headers['Content-Type'] = processedRequest.ContentType
    }
  }
  if (isErr) {
    headers['Content-Type'] = 'text/plain'
  }
  return headers
}

const beforeHandleRequest = (event) => {
  const result = {
    allowed: true
  }
  if (security.shouldSkipRequest(event.path)) {
    result.allowed = false
    result.response = {
      statusCode: 404,
      headers: getResponseHeaders(null, true),
      body: null,
      isBase64Encoded: false
    }
  }

  return result
}
