/* eslint-env jest */
import ImageRequest from "./ImageRequest";
import HashException from "./errors/HashException";
import {calculateHash} from "./helpers/security";

describe('Testing ImageRequest', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    delete process.env.NODE_ENV
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test('Can CreateImageRequest', () => {
    const event = {
      path: '/some/prefix/images/my-object.png'
    }

    process.env.SECURITY_KEY = ''
    process.env.SOURCE_BUCKET = 'assets.test.com/some/prefix'

    const Request = new ImageRequest(event)

    expect(Request.bucket).toEqual('assets.test.com')
    expect(Request.prefix).toEqual('some/prefix')
    expect(Request.key).toEqual('some/prefix/images/my-object.png')
  })

  test('Can CreateImageRequest - with hash (valid)', () => {
    const event = {
      path: '/some/prefix/images/my-object.png',
      queryStringParameters: {
        s: ''
      }
    }
    process.env.SECURITY_KEY = '12345asdf'
    process.env.SOURCE_BUCKET = 'assets.test.com/some/prefix'
    event.queryStringParameters.s = calculateHash(event.path, event.queryStringParameters, process.env.SECURITY_KEY)

    const Request = new ImageRequest(event)

    expect(Request.bucket).toEqual('assets.test.com')
    expect(Request.prefix).toEqual('some/prefix')
    expect(Request.key).toEqual('some/prefix/images/my-object.png')
  })

  test('Can CreateImageRequest - with hash (invalid)', () => {
    const event = {
      path: '/some/prefix/images/my-object.png',
      queryStringParameters: {
        s: ''
      }
    }
    process.env.SECURITY_KEY = '12345asdf'
    process.env.SOURCE_BUCKET = 'assets.test.com/some/prefix'

    const hash = 'password'

    event.queryStringParameters.s = hash

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const request = new ImageRequest(event)
    }).toThrow(HashException)
  })
})
