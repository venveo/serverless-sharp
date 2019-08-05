const eventParser = require('../../helpers/eventParser');

test('parseImageKey gets basic path', () => {
    expect(eventParser.parseImageKey('images/image.png')).toMatch('images/image.png');
    expect(eventParser.parseImageKey('/images/image.png')).toMatch('images/image.png');
});

test('parseImageKey gets basic path + required prefix', () => {
    expect(eventParser.parseImageKey('public/images/image.png', 'public')).toMatch('public/images/image.png');
    expect(eventParser.parseImageKey('/images/image.png', 'public')).toMatch('public/images/image.png');
    expect(eventParser.parseImageKey('/products/1-Image%20With%20Space/2%20Product%20Image.png', 'public')).toMatch('public/products/1-Image With Space/2 Product Image.png');
});

test('parseImageKey with encoded URI', () => {
    expect(eventParser.parseImageKey('/products/1-Image%20With%20Space/2%20Product%20Image.png', 'public')).toMatch('public/products/1-Image With Space/2 Product Image.png');
});

test('buildQueryStringFromObject', () => {
    // Single value
    expect(eventParser.buildQueryStringFromObject({
        'key1': 'value1'
    })).toMatch('?key1=value1');

    // Double value
    expect(eventParser.buildQueryStringFromObject({
        'key1': 'value1',
        'key2': 'value2'
    })).toMatch('?key1=value1&key2=value2');

    // Empty value
    expect(eventParser.buildQueryStringFromObject({
        'key1': '',
        'key2': 'value2'
    })).toMatch('?key1=&key2=value2');

    // Empty state
    expect(eventParser.buildQueryStringFromObject({})).toMatch('');
});

test('processSourceBucket', () => {
    // No prefix, only bucket
    expect(eventParser.processSourceBucket('my-bucket')).toMatchObject({prefix: '', bucket: 'my-bucket'});
    expect(eventParser.processSourceBucket('my-bucket/some-prefix')).toMatchObject({prefix: 'some-prefix', bucket: 'my-bucket'});
    expect(eventParser.processSourceBucket('my-bucket/some-prefix/another')).toMatchObject({prefix: 'some-prefix/another', bucket: 'my-bucket'});
    expect(eventParser.processSourceBucket('my-bucket/some-prefix//another')).toMatchObject({prefix: 'some-prefix//another', bucket: 'my-bucket'});
});



