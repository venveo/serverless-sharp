import middy from "@middy/core";
import createHttpError from "http-errors";
import {GenericInvocationEvent} from "@serverless-sharp/core/lib/types/common";
import {shouldSkipRequest} from "@serverless-sharp/core/lib/utils/security";

const pathCheckMiddleware = (): middy.MiddlewareObj => {

  const validatorMiddlewareBefore: middy.MiddlewareFn = async (request) => {
    const event: GenericInvocationEvent = request.event;
    const path = event.path
    if (shouldSkipRequest(path)) {
      throw new createHttpError.NotFound();
    }
  }
  return {
    before: validatorMiddlewareBefore
  }
}

export default pathCheckMiddleware