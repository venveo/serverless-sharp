import middy from "@middy/core";
import {GenericInvocationEvent} from "../types/common";
import {verifyHash} from "../utils/security";
import {getSetting} from "../utils/settings";
import createHttpError from "http-errors";

const hashCheckMiddleware = (): middy.MiddlewareObj => {
  const before: middy.MiddlewareFn = async (request) => {
    if (!getSetting('SECURITY_KEY')) {
      return;
    }

    const event: GenericInvocationEvent = request.event
    const {queryParams, path} = event


    if (queryParams.s === undefined || !queryParams.s) {
      throw new createHttpError.Forbidden('Missing security hash')
    }
    if (queryParams) {
      const hash = queryParams.s
      const isValid = verifyHash(path, queryParams, hash)
      if (!isValid) {
        throw new createHttpError.Forbidden('Incorrect security hash')
      }
    }
  }
  return {
    before
  }
}

export default hashCheckMiddleware