import * as httpRequestProcessor from './http-request-processor';
import { ProcessedImageRequest } from '../types/common';
import {
  buildQueryStringFromObject,
  extractBucketNameAndPrefix,
  extractObjectKeyFromUri, getAcceptedImageFormatsFromHeaders
} from './http-request-processor';

describe('extractObjectKeyFromUri', () => {
  it('should extract the object key from the URI', () => {
    expect(extractObjectKeyFromUri('/my-object-key')).toEqual('my-object-key');
  });

  it('should remove leading slashes from the object key', () => {
    expect(extractObjectKeyFromUri('////my-object-key')).toEqual('my-object-key');
    expect(extractObjectKeyFromUri('my-object-key')).toEqual('my-object-key');
  });

  it('should decode the object key', () => {
    expect(extractObjectKeyFromUri('/products/1-Image%20With%20Space/2%20Product%20Image.png', 'public')).toEqual('public/products/1-Image With Space/2 Product Image.png');
  });

  it('should add the required prefix to the object key', () => {
    expect(extractObjectKeyFromUri('/my-object-key', 'my-prefix')).toEqual('my-prefix/my-object-key');
  });

  it('should not add the required prefix if it is already present', () => {
    expect(extractObjectKeyFromUri('/my-prefix/my-object-key', 'my-prefix')).toEqual('my-prefix/my-object-key');
  });
});

describe('buildQueryStringFromObject', () => {
  it('returns an empty string for an empty object', () => {
    expect(buildQueryStringFromObject({})).toBe('');
  });

  it('returns a query string for a non-empty object', () => {
    expect(buildQueryStringFromObject({ a: '1', b: '2' })).toBe('?a=1&b=2');
    expect(buildQueryStringFromObject({ a: '1', b: '' })).toBe('?a=1&b=');
    expect(buildQueryStringFromObject({ a: '', b: '1' })).toBe('?a=&b=1');
  });

  it('excludes the `s` query parameter', () => {
    expect(buildQueryStringFromObject({ a: '1', s: '2' })).toBe('?a=1');
    expect(buildQueryStringFromObject({ s: '2' })).toBe('');
  });

  it('properly encodes special characters in the query string', () => {
    expect(buildQueryStringFromObject({ a: '1', b: 'foo bar' })).toBe('?a=1&b=foo%20bar');
  });
});

describe('extractBucketNameAndPrefix', () => {
  it('should extract the name and prefix from a full path with a prefix', () => {
    const fullPath = 'bucket/some-path/to-objects'
    const expected = { name: 'bucket', prefix: 'some-path/to-objects' }
    expect(extractBucketNameAndPrefix(fullPath)).toEqual(expected)
  })

  it('should extract the name and set the prefix to null if no prefix is present', () => {
    const fullPath = 'bucket'
    const expected = { name: 'bucket', prefix: null }
    expect(extractBucketNameAndPrefix(fullPath)).toEqual(expected)
  })

  it('should handle multiple slashes in the prefix', () => {
    const fullPath = 'bucket/some//path/to/objects'
    const expected = { name: 'bucket', prefix: 'some//path/to/objects' }
    expect(extractBucketNameAndPrefix(fullPath)).toEqual(expected)
  })

  it('should handle trailing slashes', () => {
    const fullPath = 'bucket////'
    const expected = { name: 'bucket', prefix: '///' }
    expect(extractBucketNameAndPrefix(fullPath)).toEqual(expected)
  })

  it('should handle a full path that consists of only a single slash', () => {
    const fullPath = '/'
    const expected = { name: '/', prefix: null }
    expect(extractBucketNameAndPrefix(fullPath)).toEqual(expected)
  })

  it('should handle an empty full path', () => {
    const fullPath = ''
    const expected = { name: '', prefix: null }
    expect(extractBucketNameAndPrefix(fullPath)).toEqual(expected)
  })
})

describe('getAcceptedImageFormatsFromHeaders', () => {
  it('returns an empty array if the headers object is null or undefined', () => {
    expect(getAcceptedImageFormatsFromHeaders(null)).toEqual([]);
    expect(getAcceptedImageFormatsFromHeaders(undefined)).toEqual([]);
  });

  it('returns an empty array if the accept header is not present in the headers object', () => {
    expect(getAcceptedImageFormatsFromHeaders({})).toEqual([]);
    expect(getAcceptedImageFormatsFromHeaders({ foo: 'bar' })).toEqual([]);
  });

  it('returns an array of image formats if the accept header is present in the headers object', () => {
    expect(getAcceptedImageFormatsFromHeaders({ accept: 'image/avif,image/webp' })).toEqual([
      'avif',
      'webp'
    ]);
    expect(getAcceptedImageFormatsFromHeaders({ accept: 'image/webp,image/avif' })).toEqual([
      'webp',
      'avif'
    ]);
  });
});


describe('getResponseHeaders', () => {
  const processedRequest: ProcessedImageRequest = {
    Body: Buffer.from('foo'),
    CacheControl: 'public, max-age=3600',
    ContentLength: 3,
    ContentType: 'image/jpeg'
  };
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2020-01-01 03:24:00 GMT'));

  const responseHeaders = httpRequestProcessor.getResponseHeaders(processedRequest);
  test('Default headers', () => {
    expect(responseHeaders).toMatchObject({
      ...responseHeaders,
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'image/jpeg',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Last-Modified': 'Wed, 01 Jan 2020 03:24:00 GMT' // Note: we mocked the system time above
    });
  });

});