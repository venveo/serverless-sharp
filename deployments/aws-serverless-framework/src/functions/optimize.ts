import {
  APIGatewayProxyResult, Handler
} from "aws-lambda";

import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpErrorHandler from '@middy/http-error-handler'
import convertApiGwToGeneric from "../middleware/convertApiGwToGeneric";
import pathCheckMiddleware from "../middleware/pathCheckMiddleware";
import hashCheckMiddleware from "../middleware/hashCheckMiddleware";

import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import ImageRequest from "@serverless-sharp/core/src/ImageRequest";
import ImageHandler from "@serverless-sharp/core/src/ImageHandler";
import {GenericInvocationEvent} from "@serverless-sharp/core/src/types/common";
import {getResponseHeaders} from "@serverless-sharp/core/src/utils/httpRequestProcessor";

const logger = new Logger({
  serviceName: 'serverlessSharp.optimize'
});

/**
 * Entrypoint for the Lambda function to process images
 * @param event - The event object from our proxy
 * @param context - Event context data
 */
const lambdaFunction: Handler = async function (event: GenericInvocationEvent, context): Promise<APIGatewayProxyResult> {
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

  const originalImageSize = <number>imageRequest.inputObjectSize
  const newImageSize = processedRequest.ContentLength
  const sizeDifference = newImageSize - originalImageSize

  if (sizeDifference > 0) {
    logger.warn('Output size was larger than input size', {newImageSize, originalImageSize, sizeDifference})
  }
  const percentChange = ((newImageSize - originalImageSize) / originalImageSize) * 100
  const response = {
    statusCode: 200,
    headers: {
      ...getResponseHeaders(processedRequest),
      'x-ss-delta': percentChange
    },
    body: processedRequest.Body,
    isBase64Encoded: true
  }
  if (context && context.succeed !== undefined) {
    context.succeed(response)
  }
  return response
}

export const handler = middy()
  .use(injectLambdaContext(logger))
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
  // Ensures a valid hash is present if needed
  .use(hashCheckMiddleware())
  .handler(lambdaFunction)