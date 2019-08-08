const schemaParser = require('./schemaParser');


test('replaceAliases - compare objects', () => {
    const replaced = schemaParser.replaceAliases({
        "f": "asdf",
        "m": "asdff",
        "no-touch": "foo",
        "fit": "hello" // This will get over-written
    });

    expect(replaced).toMatchObject({
        "fit": "asdf",
        "mark": "asdff",
        "no-touch": "foo"
    });
});


describe('Tests for schema validation', () => {
    test('Test valid', () => {
        const request = {
            "f": "png",
            'fp-x': "0.5",
            'fp-y': "0.5",
            // "m": "asdff",
            // "ar": "1:1",
            // "auto": "format,bleh,redeye,asdff",
            // "no-touch": "foo",
            "fit": "crop" // This will get over-written
        };
        const schema = schemaParser.getSchemaForQueryParams(request);
        const validated = schemaParser.normalizeAndValidateSchema(schema, request);
    });
});
