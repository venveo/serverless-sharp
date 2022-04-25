export interface ImageOptimizeRequestParameters {
  queryParametersString: string | null,
  path: string,
  bucket: string,
}

export type ParsedSchemaItem = {
  passed: boolean,
  processedValue: any,
  implicit: boolean,
  schema: object,
  expectation: object
}

export type BucketDetails = {
  name: string,
  prefix: string|null
}


export interface QueryStringParameters {
  [index: string]: string;
}

export interface RequestHeaders {
  [index: string]: string;
}


