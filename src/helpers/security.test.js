/* eslint-env jest */
const security = require('./security')

describe('Testing hash security', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    delete process.env.NODE_ENV
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test('verifyHash security basic', () => {
    process.env.SECURITY_KEY = 'abc'

    const expected = 'c0cc964fadbc6d98fed91934aa122d0c'

    expect(security.verifyHash(
      'my-image.png',
      {
        s: 'I should not be noticed'
      },
      expected
    )).toBeTruthy()

    expect(security.verifyHash(
      'my-image.png',
      {
        s: 'I should not be noticed',
        w: 1000
      },
      expected
    )).toBeFalsy()

    expect(security.verifyHash(
      'my-image.png',
      {
        s: 'I should not be noticed',
        w: 1000
      },
      'c3d2851275ba7ddb0aa603b52f87e71b'
    )).toBeTruthy()
  })

  test('verifyHash security sub-path', () => {
    process.env.SECURITY_KEY = 'abc'

    const expected = '8d499d50fe7f9a33c0bc24031d04d0f0'

    expect(security.verifyHash(
      'sub/path/my-image.png',
      {
        s: 'I should not be noticed'
      },
      expected
    )).toBeTruthy()

    expect(security.verifyHash(
      'sub/path/my-image.png',
      {
        s: 'I should not be noticed',
        w: 1000
      },
      expected
    )).toBeFalsy()

    expect(security.verifyHash(
      'sub/path/my-image.png',
      {
        s: 'I should not be noticed',
        w: 1000
      },
      '69e5b437c344d538a1d723ae4b5154a8'
    )).toBeTruthy()

    // Tests complex security key as well as capitalized hash
    process.env.SECURITY_KEY = '#1224$12'
    expect(security.verifyHash(
      'test/my-image.jpg.jpg',
      {
        q: 100,
        h: 100,
        w: 700
      },
      '1B43B1D02BE0090698118229933CA2B0'
    )).toBeTruthy()
  })

  test('verifyHash security encoded', () => {
    process.env.SECURITY_KEY = 'abc'

    const path = 'sub/path/my image+cool.png'
    const pathEncoded = 'sub/path/my%20image%2Bcool.png'
    const expected = 'de7f3de7ff2f2a4b7a6528a831c90fdc'
    expect(security.verifyHash(
      path,
      {
        s: 'I should not be noticed'
      },
      expected
    )).toBeTruthy()

    expect(security.verifyHash(
      pathEncoded,
      {
        s: 'I should not be noticed'
      },
      expected
    )).toBeTruthy()
  })
})

describe('Testing shouldSkipRequest', () => {
  const path = '/images/example.png'
  test('No settings', () => {
    expect(security.shouldSkipRequest(path)).toBeFalsy()
  })

  test('Ignored file', () => {
    process.env.SLS_IGNORE = 'images/example.png,favicon.ico'
    expect(security.shouldSkipRequest(path)).toBeTruthy()
  })

  test('RegEx Pattern - Skip', () => {
    process.env.SLS_IGNORE = 'favicon.ico'
    process.env.SLS_VALID_PATH_REGEX = '^\/images\/.+'
    expect(security.shouldSkipRequest(path)).toBeFalsy()
  })

  test('RegEx Pattern - Dont Skip', () => {
    process.env.SLS_IGNORE = 'favicon.ico'
    process.env.SLS_VALID_PATH_REGEX = '^\/public-images\/.+'
    expect(security.shouldSkipRequest(path)).toBeTruthy()
  })
})
