import * as httpRequestProcessor from "./httpRequestProcessor";
import {ProcessedImageRequest} from "../types/common";

describe('extractObjectKeyFromUri', () => {
  test('gets basic path', () => {
    expect(httpRequestProcessor.extractObjectKeyFromUri('images/image.png')).toEqual('images/image.png')
    expect(httpRequestProcessor.extractObjectKeyFromUri('/images/image.png')).toEqual('images/image.png')
  })

  test('gets basic path + required prefix', () => {
    expect(httpRequestProcessor.extractObjectKeyFromUri('public/images/image.png', 'public')).toEqual('public/images/image.png')
    expect(httpRequestProcessor.extractObjectKeyFromUri('/images/image.png', 'public')).toEqual('public/images/image.png')
    expect(httpRequestProcessor.extractObjectKeyFromUri('/products/1-Image%20With%20Space/2%20Product%20Image.png', 'public')).toEqual('public/products/1-Image With Space/2 Product Image.png')
  })

  test('with encoded URI', () => {
    expect(httpRequestProcessor.extractObjectKeyFromUri('/products/1-Image%20With%20Space/2%20Product%20Image.png', 'public')).toEqual('public/products/1-Image With Space/2 Product Image.png')
  })
});

describe('buildQueryStringFromObject', () => {
  test('single string value', () => {
    // Single value
    expect(httpRequestProcessor.buildQueryStringFromObject({
      key1: 'value1'
    })).toEqual('?key1=value1')
  })

  test('double string value', () => {
    // Double value
    expect(httpRequestProcessor.buildQueryStringFromObject({
      key1: 'value1',
      key2: 'value2'
    })).toEqual('?key1=value1&key2=value2')
  })

  test('remove security hashes', () => {
    // Security hashes should get removed
    expect(httpRequestProcessor.buildQueryStringFromObject({
      key1: 'value1',
      s: 'abcde'
    })).toEqual('?key1=value1')
  })

  test('empty value - security hash', () => {
    // No values should be empty string
    expect(httpRequestProcessor.buildQueryStringFromObject({
      s: 'abcde'
    })).toEqual('')
  })

  test('empty value - no parameters', () => {
    // No values should be empty string
    expect(httpRequestProcessor.buildQueryStringFromObject({})).toEqual('')
  })

  test('empty value - only key present', () => {
    // Empty value
    expect(httpRequestProcessor.buildQueryStringFromObject({
      key1: '',
      key2: 'value2'
    })).toEqual('?key1=&key2=value2')
  })
})

describe('processSourceBucket', () => {
  test('no prefix - only bucket name', () => {
    // No prefix, only bucket
    expect(httpRequestProcessor.extractBucketNameAndPrefix('my-bucket')).toMatchObject({
      prefix: null,
      name: 'my-bucket'
    })
  });

  test('prefix + bucket name', () => {
    expect(httpRequestProcessor.extractBucketNameAndPrefix('my-bucket/some-prefix')).toMatchObject({
      prefix: 'some-prefix',
      name: 'my-bucket'
    })
  })

  test('prefix with subdirectory + bucket name', () => {
    expect(httpRequestProcessor.extractBucketNameAndPrefix('my-bucket/some-prefix/another')).toMatchObject({
      prefix: 'some-prefix/another',
      name: 'my-bucket'
    })
  })
  test('prefix with double-slashes + bucket name', () => {
    expect(httpRequestProcessor.extractBucketNameAndPrefix('my-bucket/some-prefix//another')).toMatchObject({
      prefix: 'some-prefix//another',
      name: 'my-bucket'
    })
  })
})

describe('getResponseHeaders', () => {
  const processedRequest: ProcessedImageRequest = {
    Body: 'foo',
    CacheControl: 'public, max-age=3600',
    ContentLength: 3,
    ContentType: 'image/jpeg'
  }
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2020-01-01 03:24:00 GMT'));

  const responseHeaders = httpRequestProcessor.getResponseHeaders(processedRequest)
  test('Default headers', () => {
    expect(responseHeaders).toMatchObject({
      ...responseHeaders,
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'image/jpeg',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Last-Modified': 'Wed, 01 Jan 2020 03:24:00 GMT' // Note: we mocked the system time above
    })
  });

});