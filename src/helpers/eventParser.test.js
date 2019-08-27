/* eslint-env jest */
const eventParser = require('./eventParser')

test('parseImageKey gets basic path', () => {
  expect(eventParser.parseImageKey('images/image.png')).toEqual('images/image.png')
  expect(eventParser.parseImageKey('/images/image.png')).toEqual('images/image.png')
})

test('parseImageKey gets basic path + required prefix', () => {
  expect(eventParser.parseImageKey('public/images/image.png', 'public')).toEqual('public/images/image.png')
  expect(eventParser.parseImageKey('/images/image.png', 'public')).toEqual('public/images/image.png')
  expect(eventParser.parseImageKey('/products/1-Image%20With%20Space/2%20Product%20Image.png', 'public')).toEqual('public/products/1-Image With Space/2 Product Image.png')
})

test('parseImageKey with encoded URI', () => {
  expect(eventParser.parseImageKey('/products/1-Image%20With%20Space/2%20Product%20Image.png', 'public')).toEqual('public/products/1-Image With Space/2 Product Image.png')
})

test('buildQueryStringFromObject', () => {
  // Single value
  expect(eventParser.buildQueryStringFromObject({
    key1: 'value1'
  })).toEqual('?key1=value1')

  // Double value
  expect(eventParser.buildQueryStringFromObject({
    key1: 'value1',
    key2: 'value2'
  })).toEqual('?key1=value1&key2=value2')

  // Security hashes should get removed
  expect(eventParser.buildQueryStringFromObject({
    key1: 'value1',
    s: 'abcde'
  })).toEqual('?key1=value1')

  // No values should be empty string
  expect(eventParser.buildQueryStringFromObject({
    s: 'abcde'
  })).toEqual('')

  // No values should be empty string
  expect(eventParser.buildQueryStringFromObject({})).toEqual('')

  // Empty value
  expect(eventParser.buildQueryStringFromObject({
    key1: '',
    key2: 'value2'
  })).toEqual('?key1=&key2=value2')

  // Empty state
  expect(eventParser.buildQueryStringFromObject({})).toEqual('')
})

test('processSourceBucket', () => {
  // No prefix, only bucket
  expect(eventParser.processSourceBucket('my-bucket')).toMatchObject({ prefix: '', bucket: 'my-bucket' })
  expect(eventParser.processSourceBucket('my-bucket/some-prefix')).toMatchObject({
    prefix: 'some-prefix',
    bucket: 'my-bucket'
  })
  expect(eventParser.processSourceBucket('my-bucket/some-prefix/another')).toMatchObject({
    prefix: 'some-prefix/another',
    bucket: 'my-bucket'
  })
  expect(eventParser.processSourceBucket('my-bucket/some-prefix//another')).toMatchObject({
    prefix: 'some-prefix//another',
    bucket: 'my-bucket'
  })
})
