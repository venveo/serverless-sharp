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
  let imageRequest = null

  try {
    imageRequest = new ImageRequest(event)
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
    let response = {
      statusCode: err.status,
      headers: getResponseHeaders(null, true),
      body: JSON.stringify(err),
      isBase64Encoded: false
    }
    if(imageRequest && imageRequest.originalImageBody){
      response = {
        statusCode: 200,
        headers: getResponseHeaders(null, true),
        body: imageRequest.originalImageBody.toString('utf8'),
        isBase64Encoded: false
      }
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
  const headers = {
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': true
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
