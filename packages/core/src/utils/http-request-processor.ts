import {
  QueryStringParameters,
  BucketDetails,
  GenericHeaders,
  ImageExtension,
  ProcessedImageRequest
} from "../types/common";
import {getSetting} from "./settings";

/**
 * Extracts the name of the appropriate Amazon S3 object
 *
 * @param uri - The URI from the request. Leading slashes will be removed automatically
 * @param requiredPrefix - A prefix to prepend to the key. A trailing slash will be added automatically
 */
export function extractObjectKeyFromUri(uri: string, requiredPrefix: string | null = null): string {
  // Decode the image request and return the image key
  // Ensure the path starts with our prefix
  let key = decodeURIComponent(uri)
  key = key.replace(/^\/+/, '')

  if (requiredPrefix !== null) {
    if (key.indexOf(requiredPrefix) !== 0) {
      key = requiredPrefix + '/' + key
    }
  }
  return key
}

export function buildQueryStringFromObject(queryStringParameters: QueryStringParameters): string {
  const parts: string[] = []
  for (const key of Object.keys(queryStringParameters)) {
    if (key !== 's') {
      parts.push(`${key}=${encodeURIComponent(<string>queryStringParameters[key])}`)
    }
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

/**
 * Extracts the name of a bucket and a path prefix, if defined
 *
 * Example:
 * ```
 *  bucket/some-path/to-objects
 * \{name: 'bucket', prefix: 'some-path/to-objects'\}
 * ```
 */
export function extractBucketNameAndPrefix(fullPath: string): BucketDetails {

  const parts = fullPath.split(/\/(.+)/)
  const name = parts[0] ?? null
  const prefix = parts[1] ?? null
  if (name === null) {
    throw new Error('Failed to detect bucket name')
  }
  return {
    name,
    prefix
  }
}

/**
 * Parses headers from an event and retrieves special compatibility cases for modern image types
 */
export function getAcceptedImageFormatsFromHeaders(headers: GenericHeaders): string[] {
  if (!headers?.accept) {
    return [];
  }
  const specialFormats: Record<string, ImageExtension> = {
    'image/avif': ImageExtension.AVIF,
    // 'image/apng': 'apng', // apng is not supported by Sharp yet
    'image/webp': ImageExtension.WEBP
  }
  return headers.accept.toString()
    .split(',')
    .flatMap((mime: string) => {
      return specialFormats[mime] ?? []
    })
}



/**
 * Generates the appropriate set of response headers based on a successful optimization
 * @param processedRequest - A processed request object
 */
export function getResponseHeaders(processedRequest: ProcessedImageRequest): GenericHeaders {
  const timeNow = new Date()
  const headers: GenericHeaders = {
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Last-Modified': timeNow.toUTCString()
  }
  const cacheControlDefault = <string>getSetting('DEFAULT_CACHE_CONTROL')
  if (processedRequest.CacheControl) {
    headers['Cache-Control'] = processedRequest.CacheControl
  } else if (cacheControlDefault) {
    headers['Cache-Control'] = cacheControlDefault
  }
  headers['Content-Type'] = processedRequest.ContentType

  return headers
}