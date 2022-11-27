import middy from "@middy/core";
import {GenericHeaders, QueryStringParameters} from "@serverless-sharp/core/lib/types/common";

/**
 * Converts an APIGatewayRequest to a GenericInvocationEvent
 */
const convertApiGwToGenericMiddleware = (): middy.MiddlewareObj => {

  const before: middy.MiddlewareFn = async (request) => {
    request.event = {
      queryParams: <QueryStringParameters>request.event.queryStringParameters ?? {},
      path: request.event.path,
      headers: <GenericHeaders>request.event.headers ?? {}
    }
  }
  return {
    before
  }
}

export default convertApiGwToGenericMiddleware