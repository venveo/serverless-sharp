import type { GenericHttpInvocationEvent } from './types/common';
import { fromPromise, ResultAsync } from 'neverthrow';
import ImageRequest from './ImageRequest';

export * as ImageRequest from './ImageRequest';
export * as ImageHandler from './ImageHandler';

export const createImageRequest = (config: GenericHttpInvocationEvent): ResultAsync<ImageRequest, string> => {
  const request = new ImageRequest(config);
  return fromPromise(request.process(), () => {
    return 'Failed to create image request'
  });
};