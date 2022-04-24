import ImageRequest from "../ImageRequest";
import ImageHandler from "../ImageHandler";

import {shouldSkipRequest} from "../utils/security";
import {getSetting} from "../utils/settings";
import {Handler} from "aws-lambda";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";

export const handler: Handler = async function (event: APIGatewayProxyEvent, context): Promise<APIGatewayProxyResult> {
  const beforeHandle = beforeHandleRequest(event)

  if (!beforeHandle.allowed) {
    if (context && context.succeed) {
      context.succeed(beforeHandle.response)
    }
    return beforeHandle.response
  }

  try {
    const imageRequest = new ImageRequest(event)
    await imageRequest.process() // This is important! We need to load the metadata off the image and check the format
    const imageHandler = new ImageHandler(imageRequest)

    const processedRequest = await imageHandler.process()

    const originalImageSize = imageRequest.originalImageSize
    const newImageSize = processedRequest.ContentLength
    const sizeDifference = newImageSize - originalImageSize

    if (sizeDifference > 0) {
      console.warn('Output size was larger than input size', {newImageSize, originalImageSize, sizeDifference})
    }
    const response = {
      statusCode: 200,
      headers: getResponseHeaders(processedRequest, false),
      body: processedRequest.Body,
      isBase64Encoded: true
    }
    if (context && context.succeed) {
      context.succeed(response)
    }
    return response
  } catch (err) {
    console.error(err);
    const response = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      statusCode: err.status,
      headers: getResponseHeaders(null, true),
      body: JSON.stringify(err),
      isBase64Encoded: false
    }
    if (context && context.succeed) {
      context.succeed(response)
    }
    return response
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
  const cacheControlDefault = getSetting('DEFAULT_CACHE_CONTROL')
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
    allowed: true,
    response: null
  }
  // Handle API Gateway events AND Lambda URL events
  const path = event['rawPath'] !== undefined ? event.rawPath : event.path
  if (shouldSkipRequest(path)) {
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
