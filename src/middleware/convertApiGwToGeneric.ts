import middy from "@middy/core";
import {GenericHeaders, GenericInvocationEvent, QueryStringParameters} from "../types/common";

/**
 * Converts an APIGatewayRequest to a GenericInvocationEvent
 */
const convertApiGwToGenericMiddleware = (): middy.MiddlewareObj => {

  const before: middy.MiddlewareFn = async (request) => {
    const { event } = request
    request.event = {
      queryParams: <QueryStringParameters>event.queryStringParameters ?? {},
      path: event.path,
      headers: <GenericHeaders>event.headers ?? {}
    }
  }
  return {
    before
  }
}

export default convertApiGwToGenericMiddleware