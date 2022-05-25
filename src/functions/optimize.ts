import ImageRequest from "../ImageRequest";
import ImageHandler from "../ImageHandler";

import {shouldSkipRequest} from "../utils/security";
import {getSetting} from "../utils/settings";
import {Handler} from "aws-lambda";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";
import {
  GenericInvocationEvent,
  QueryStringParameters,
  GenericHeaders, GenericInvocationResponse, ProcessedImageRequest
} from "../types/common";

export const handler: Handler = async function (event: APIGatewayProxyEvent, context): Promise<APIGatewayProxyResult> {
  const normalizedEvent: GenericInvocationEvent = {
    queryParams: event.queryStringParameters as QueryStringParameters,
    path: event.path,
    headers: event.headers as GenericHeaders
  }

  const beforeHandle = beforeHandleRequest(normalizedEvent)

  if (!beforeHandle.allowed) {
    if (context && context.succeed) {
      context.succeed(beforeHandle.response)
    }
    return beforeHandle.response as APIGatewayProxyResult
  }

  try {
    const imageRequest = new ImageRequest(normalizedEvent)

    // This is important! We need to load the metadata off the image and check the format
    await imageRequest.process()
    const imageHandler = new ImageHandler(imageRequest)

    const processedRequest = await imageHandler.process()

    const originalImageSize = imageRequest.inputObjectSize as number
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
    if (context && context.succeed !== undefined) {
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
const getResponseHeaders = (processedRequest: ProcessedImageRequest | null, isErr = false): GenericHeaders => {
  const timeNow = new Date()
  const headers: GenericHeaders = {
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': true, // TODO: Should this be a string?
    'Last-Modified': timeNow.toString()
  }
  const cacheControlDefault = getSetting('DEFAULT_CACHE_CONTROL')
  if (processedRequest) {
    if (processedRequest.CacheControl) {
      headers['Cache-Control'] = processedRequest.CacheControl
    } else if (cacheControlDefault) {
      headers['Cache-Control'] = cacheControlDefault
    }
    headers['Content-Type'] = processedRequest.ContentType
  }
  if (isErr) {
    headers['Content-Type'] = 'text/plain'
  }
  return headers
}

const beforeHandleRequest = (normalizedEvent: GenericInvocationEvent) => {
  const result: { allowed: boolean; response: GenericInvocationResponse | null } = {
    allowed: true,
    response: null
  }
  // Handle API Gateway events AND Lambda URL events
  const path = normalizedEvent.path
  if (shouldSkipRequest(path)) {
    result.allowed = false
    result.response = {
      statusCode: 404,
      headers: getResponseHeaders(null, true),
      body: '',
      isBase64Encoded: false
    }
  }

  return result
}
