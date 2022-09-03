import middy from "@middy/core";
import {GenericInvocationEvent} from "../types/common";
import {shouldSkipRequest} from "../utils/security";
import createHttpError from "http-errors";

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