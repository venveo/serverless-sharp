const security = require('../../helpers/security');

describe('Testing hash security', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
        delete process.env.NODE_ENV;
    });

    afterEach(() => {
        process.env = OLD_ENV;
    });

    test('verifyHash security basic', () => {
        process.env.SECURITY_KEY = 'abc';

        const expected = 'c0cc964fadbc6d98fed91934aa122d0c';

        expect(security.verifyHash(
            'my-image.png',
            {
                s: 'I should not be noticed'
            },
            expected
        )).toBeTruthy();

        expect(security.verifyHash(
            'my-image.png',
            {
                s: 'I should not be noticed',
                w: 1000
            },
            expected
        )).toBeFalsy();

        expect(security.verifyHash(
            'my-image.png',
            {
                s: 'I should not be noticed',
                w: 1000
            },
            'c3d2851275ba7ddb0aa603b52f87e71b'
        )).toBeTruthy();
    });


    test('verifyHash security sub-path', () => {
        process.env.SECURITY_KEY = 'abc';

        const expected = '8d499d50fe7f9a33c0bc24031d04d0f0';

        expect(security.verifyHash(
            'sub/path/my-image.png',
            {
                s: 'I should not be noticed'
            },
            expected
        )).toBeTruthy();

        expect(security.verifyHash(
            'sub/path/my-image.png',
            {
                s: 'I should not be noticed',
                w: 1000
            },
            expected
        )).toBeFalsy();

        expect(security.verifyHash(
            'sub/path/my-image.png',
            {
                s: 'I should not be noticed',
                w: 1000
            },
            '69e5b437c344d538a1d723ae4b5154a8'
        )).toBeTruthy();
    });

    test('verifyHash security encoded', () => {
        process.env.SECURITY_KEY = 'abc';

        const path = 'sub/path/my image+cool.png';
        const pathEncoded = 'sub/path/my%20image%2Bcool.png';
        const expected = 'de7f3de7ff2f2a4b7a6528a831c90fdc';
        expect(security.verifyHash(
            path,
            {
                s: 'I should not be noticed'
            },
            expected
        )).toBeTruthy();

        expect(security.verifyHash(
            pathEncoded,
            {
                s: 'I should not be noticed'
            },
            expected
        )).toBeTruthy();
    });

});


