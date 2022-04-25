import * as httpRequestProcessor from "./httpRequestProcessor";

test('extractObjectKeyFromUri gets basic path', () => {
  expect(httpRequestProcessor.extractObjectKeyFromUri('images/image.png')).toEqual('images/image.png')
  expect(httpRequestProcessor.extractObjectKeyFromUri('/images/image.png')).toEqual('images/image.png')
})

test('extractObjectKeyFromUri gets basic path + required prefix', () => {
  expect(httpRequestProcessor.extractObjectKeyFromUri('public/images/image.png', 'public')).toEqual('public/images/image.png')
  expect(httpRequestProcessor.extractObjectKeyFromUri('/images/image.png', 'public')).toEqual('public/images/image.png')
  expect(httpRequestProcessor.extractObjectKeyFromUri('/products/1-Image%20With%20Space/2%20Product%20Image.png', 'public')).toEqual('public/products/1-Image With Space/2 Product Image.png')
})

test('extractObjectKeyFromUri with encoded URI', () => {
  expect(httpRequestProcessor.extractObjectKeyFromUri('/products/1-Image%20With%20Space/2%20Product%20Image.png', 'public')).toEqual('public/products/1-Image With Space/2 Product Image.png')
})

test('buildQueryStringFromObject', () => {
  // Single value
  expect(httpRequestProcessor.buildQueryStringFromObject({
    key1: 'value1'
  })).toEqual('?key1=value1')

  // Double value
  expect(httpRequestProcessor.buildQueryStringFromObject({
    key1: 'value1',
    key2: 'value2'
  })).toEqual('?key1=value1&key2=value2')

  // Security hashes should get removed
  expect(httpRequestProcessor.buildQueryStringFromObject({
    key1: 'value1',
    s: 'abcde'
  })).toEqual('?key1=value1')

  // No values should be empty string
  expect(httpRequestProcessor.buildQueryStringFromObject({
    s: 'abcde'
  })).toEqual('')

  // No values should be empty string
  expect(httpRequestProcessor.buildQueryStringFromObject({})).toEqual('')

  // Empty value
  expect(httpRequestProcessor.buildQueryStringFromObject({
    key1: '',
    key2: 'value2'
  })).toEqual('?key1=&key2=value2')

  // Empty state
  expect(httpRequestProcessor.buildQueryStringFromObject({})).toEqual('')
})

test('processSourceBucket', () => {
  // No prefix, only bucket
  expect(httpRequestProcessor.extractBucketNameAndPrefix('my-bucket')).toMatchObject({prefix: null, name: 'my-bucket'})
  expect(httpRequestProcessor.extractBucketNameAndPrefix('my-bucket/some-prefix')).toMatchObject({
    prefix: 'some-prefix',
    name: 'my-bucket'
  })
  expect(httpRequestProcessor.extractBucketNameAndPrefix('my-bucket/some-prefix/another')).toMatchObject({
    prefix: 'some-prefix/another',
    name: 'my-bucket'
  })
  expect(httpRequestProcessor.extractBucketNameAndPrefix('my-bucket/some-prefix//another')).toMatchObject({
    prefix: 'some-prefix//another',
    name: 'my-bucket'
  })
})
