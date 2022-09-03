import ImageRequest from "../ImageRequest";
import ImageHandler from "../ImageHandler";

import {Handler} from "aws-lambda";

import {
  APIGatewayProxyResult
} from "aws-lambda";
import {
  GenericInvocationEvent,
} from "../types/common";
import {getResponseHeaders} from "../utils/httpRequestProcessor";

import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpErrorHandler from '@middy/http-error-handler'
import convertApiGwToGeneric from "../middleware/convertApiGwToGeneric";
import pathCheckMiddleware from "../middleware/pathCheckMiddleware";

/**
 * Entrypoint for the Lambda function to process images
 * @param event - The event object from our proxy
 * @param context - Event context data
 */
const lambdaFunction: Handler = async function (event: GenericInvocationEvent, context): Promise<APIGatewayProxyResult> {

  try {
    // The purpose of the ImageRequest object is to handle downloading the image and
    // interpreting its metadata
    const imageRequest = new ImageRequest(event)

    // This is important! We need to load the metadata off the image and check the format
    // In the future, we should probably ditch the image request object in favor of a
    // functional approach (i.e. ImageRequest becomes an interface that gets operated on)
    await imageRequest.process()

    // The purpose of the ImageHandler is to actually perform the image manipulations
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

export const handler = middy()
  // Normalize potential AWS event sources
  .use(httpEventNormalizer())
  // Normalize potential differences in header formatting (e.g. all headers will be converted to lower-case)
  .use(httpHeaderNormalizer())
  // Convert the API Gateway event we just normalized into a GenericInvocationEvent
  .use(convertApiGwToGeneric())
  // Allows us to use http-errors library as responses
  .use(httpErrorHandler())
  // Ensure the requested file path is allowed
  .use(pathCheckMiddleware())
  .handler(lambdaFunction)