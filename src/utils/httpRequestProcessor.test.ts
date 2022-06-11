import * as httpRequestProcessor from "./httpRequestProcessor";

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