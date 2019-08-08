const schemaParser = require('./schemaParser');
const ExpectationTypeException = require('../errors/ExpectationTypeException');

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
    test('Test invalid', () => {
        const request = {
            "f": "png",
            'fp-x': "0.5",
            'fp-y': "0.5",
            "fit": "crop"
        };
        const schema = schemaParser.getSchemaForQueryParams(request);

        expect(() => {schemaParser.normalizeAndValidateSchema(schema, request)}).toThrow(ExpectationTypeException)
    });

    test('Test valid', () => {
        const request = {
            "f": "png",
            'fp-x': "0.5",
            'fp-y': "0.5",
            "fit": "crop",
            "crop": "focalpoint"
        };
        const schema = schemaParser.getSchemaForQueryParams(request);

        schemaParser.normalizeAndValidateSchema(schema, request);
    });
});
