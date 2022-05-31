import ImageRequest from "../ImageRequest";
import ImageHandler from "../ImageHandler";

import {shouldSkipRequest} from "../utils/security";
import {Handler} from "aws-lambda";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";
import {
  GenericInvocationEvent,
  QueryStringParameters,
  GenericHeaders, GenericInvocationResponse
} from "../types/common";
import {getResponseHeaders} from "../utils/httpRequestProcessor";

export const handler: Handler = async function (event: APIGatewayProxyEvent, context): Promise<APIGatewayProxyResult> {
  const normalizedEvent: GenericInvocationEvent = {
    queryParams: <QueryStringParameters>event.queryStringParameters ?? {},
    path: event.path,
    headers: <GenericHeaders>event.headers ?? {}
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
