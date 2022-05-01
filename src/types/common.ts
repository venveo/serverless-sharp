import {ParameterType} from "./imgix";

export interface ImageOptimizeRequestParameters {
  queryParametersString: string | null,
  path: string,
  bucket: string,
}

export type ParsedSchemaItem = {
  passed: boolean,
  processedValue?: any,
  implicit: boolean,
  schema?: object,
  expectation?: object,
  message?: string
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

export type ParameterTypesSchema = { [key: string]: ParameterType }

export enum ImageExtensions {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif',
  TIFF = 'tiff',
  HEIF = 'heif',
  GIF = 'gif'
}