import {ParameterType} from "./imgix";

export type ParsedSchemaItem = {
  passed: boolean,
  processedValue?: ProcessedInputValueType,
  implicit: boolean,
  schema?: object,
  expectation?: object,
  message?: string | null
}

export type ParsedEdits = { [operation: string]: ParsedSchemaItem }

export type BucketDetails = {
  name: string,
  prefix: string | null
}


export interface QueryStringParameters {
  [parameter: string]: string;
}

export interface GenericHeaders {
  [header: string]: boolean | number | string;
}

export type ParameterTypesSchema = { [key: string]: ParameterType }

export enum ImageExtensions {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif',
  TIFF = 'tiff',
  TIF = 'tif',
  HEIF = 'heif',
  HEIC = 'heic',
  GIF = 'gif'
}

export type ProcessedInputValueType = string | number | Array<string | number> | boolean | null

export type GenericInvocationEvent = {
  path: string,
  headers?: GenericHeaders | null,
  queryParams?: QueryStringParameters | null
}

export interface GenericInvocationResponse {
  statusCode: number,
  headers: GenericHeaders | null,
  body: string,
  isBase64Encoded: boolean
}


export type ProcessedImageRequest = {
  CacheControl: string|null,
  Body: string,
  ContentType: string,
  ContentLength: number
}