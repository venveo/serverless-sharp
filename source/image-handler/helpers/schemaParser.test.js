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

test('schema tests', () => {
    const request = {
        "f": "asdf",
        "m": "asdff",
        "ar": "1:1",
        "auto": "format,bleh,redeye,asdff",
        "no-touch": "foo",
        "fit": "hello" // This will get over-written
    };
    const schema = schemaParser.getSchemaForQueryParams(request);
    const valid = schemaParser.processSchemaExpectations(schema, request);
});


test('schema tests', () => {
    const request = {
        "f": "asdf",
        "m": "asdff",
        "no-touch": "foo",
        "fit": "hello" // This will get over-written
    };
    const schema = schemaParser.getSchemaForQueryParams(request);
    console.log(schema);
    const valid = schemaParser.processSchemaExpectations(schema, request);
    console.log(valid);
});
