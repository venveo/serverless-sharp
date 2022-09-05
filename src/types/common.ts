import {AutoMode, CropMode, FillMode, ParameterType, ResizeFitMode} from "./imgix";

export type ParsedSchemaItem<T = ProcessedInputValueType> = {
  passed: boolean,
  processedValue: T,
  implicit: boolean,
  schema: ParameterType,
  // If there's an error message for this particular schema item, it will be stored here
  message?: string | null
}

export type ParsedSchemaExpectation = {
  passed: boolean,
  implicit: boolean,
  processedValue: ProcessedInputValueType,
  message: string | null
}

export type UnparsedEdits = {
  [operation: string]: ParsedSchemaItem,
}

export interface ParsedEdits extends UnparsedEdits {
  // Width
  w: ParsedSchemaItem<InputDimension | undefined>,
  // Height
  h: ParsedSchemaItem<InputDimension | undefined>,
  // Fill Mode
  fill: ParsedSchemaItem<FillMode | undefined>,
  // Aspect ratio
  ar: ParsedSchemaItem<number | undefined>,
  // Device Pixel Ratio
  dpr: ParsedSchemaItem<number | undefined>,
  // Crop mode
  crop: ParsedSchemaItem<InputCropPosition | undefined>,
  // Focalpoint X position
  'fp-x': ParsedSchemaItem<number | undefined>,
  // Focal point Y position
  'fp-y': ParsedSchemaItem<number | undefined>,
  // Fill color for when fill mode is solid
  'fill-color': ParsedSchemaItem<string | undefined>,
  // Brightness, defaults to 0
  bri: ParsedSchemaItem<number>,
  // Auto processing modes
  auto: ParsedSchemaItem<InputAutoMode | undefined>,
  // Pixelate, defaults to 0
  px: ParsedSchemaItem<number>,
  // Blur, defaults to 0
  blur: ParsedSchemaItem<number>,
  // Resize fit mode, defaults to "clip"
  fit: ParsedSchemaItem<ResizeFitMode>
}

/**
 * "auto" modes
 */
export type InputAutoMode = AutoMode[]

/**
 * "crop" modes
 */
export type InputCropPosition = CropMode[]
/**
 * "fill" modes
 */
export type InputFillMode = FillMode[]

/**
 * "fit" modes
 */
export type InputResizeFitMode = ResizeFitMode[]

/**
 * A numeric width or height in pixels
 */
export type InputDimension = number

/**
 * All possible data types that could be parsed from the query parameters
 */
export type ProcessedInputValueType =
  InputDimension
  | InputAutoMode
  | InputCropPosition
  | InputFillMode
  | InputResizeFitMode
  | string
  | number
  | Array<string | number>
  | boolean
  | null
  | undefined

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


export type GenericInvocationEvent = {
  path: string,
  headers: GenericHeaders,
  queryParams: QueryStringParameters
}


export type ProcessedImageRequest = {
  CacheControl: string | null,
  Body: string,
  ContentType: string,
  ContentLength: number
}