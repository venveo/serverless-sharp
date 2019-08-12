class ParsedSchemaItem {
  constructor (processedValue, passed, implicit = false, schema, expectation) {
    this.processedValue = processedValue
    this.passed = passed
    this.implicit = implicit
    this.schema = schema
    this.expectation = expectation
  }
}

module.exports = ParsedSchemaItem
