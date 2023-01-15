import sharp from "sharp";

import {
  extractBucketNameAndPrefix,
  extractObjectKeyFromUri,
  getAcceptedImageFormatsFromHeaders
} from "./utils/http-request-processor";

import {
  getSchemaForQueryParams,
  normalizeAndValidateSchema,
  replaceAliases
} from "./utils/schema-parser";

import {getSetting} from "./utils/settings";
import {ImageExtension} from './types/common';
import type {
  BucketDetails,
  GenericHttpInvocationEvent,
  ParsedEdits,
  QueryStringParameters
} from "./types/common";

import {GetObjectCommand, GetObjectCommandInput, GetObjectCommandOutput, S3Client} from "@aws-sdk/client-s3"
import type {Stream} from "stream";
import {normalizeExtension} from "./utils/formats";
import { schema } from './utils/schema';
import createHttpError from 'http-errors';


export default class ImageRequest {
  readonly bucketDetails: BucketDetails
  readonly key: string
  readonly event: GenericHttpInvocationEvent
  originalImageObject: GetObjectCommandOutput | null = null;
  inputObjectStream: Stream | null = null;
  inputObjectSize: number | null = null;

  readonly sharpPipeline: sharp.Sharp;
  originalMetadata: sharp.Metadata | null = null;
  edits: ParsedEdits | null = null;

  constructor(event: GenericHttpInvocationEvent) {
    this.event = event

    this.bucketDetails = extractBucketNameAndPrefix(<string>getSetting('SOURCE_BUCKET'))
    this.key = extractObjectKeyFromUri(event.path, this.bucketDetails.prefix)
    this.sharpPipeline = sharp().rotate()
  }

  /**
   * This method does a number of async things, such as getting the image object and building a schema
   */
  async process(): Promise<ImageRequest> {
    this.originalImageObject = await this.getInputObject()

    this.inputObjectStream = <Stream>this.originalImageObject?.Body
    this.inputObjectSize = this.originalImageObject.ContentLength ?? null

    // Pipe the body Stream from S3 to our sharp pipeline
    this.inputObjectStream.pipe(this.sharpPipeline)

    this.originalMetadata = await this.sharpPipeline.metadata()

    // It's important that we normalize the query parameters even if none are provided. This replaces aliases and
    // determines the proper output format for the image
    const queryParams = this.normalizeQueryParams(this.event.queryParams)

    // Extracts the relevant parameters from the schema.json file
    const schemaForQueryParams = getSchemaForQueryParams(queryParams)

    const editsResult = normalizeAndValidateSchema(schemaForQueryParams, queryParams, schema.parameters)
    if (editsResult.isOk()) {
      this.edits = editsResult.value
    } else {
      throw createHttpError.BadRequest(editsResult.error)
    }
    return this
  }

  /**
   * Determines the best compatible output format for the input request, taking into account "Accept" headers, image
   * transparency, and typical format sizes.
   * @returns Returns the new extension of the image or null if no changes should be made
   */
  getAutoFormat(): ImageExtension | null {
    if (!this.originalMetadata || this.originalMetadata.format === undefined) {
      return null;
    }
    const originalFormat = <ImageExtension>normalizeExtension(this.originalMetadata.format)

    const headers = this.event.headers ?? {}
    const coercibleFormats = [ImageExtension.JPEG, ImageExtension.PNG, ImageExtension.WEBP, ImageExtension.AVIF, ImageExtension.JPG, ImageExtension.TIFF]
    let autoParam: string[] = []
    if (this.event.queryParams.auto) {
      autoParam = this.event.queryParams.auto.split(',')
    }
    const specialOutputFormats = getAcceptedImageFormatsFromHeaders(headers)

    if (
      !autoParam ||
      !autoParam.includes('format') ||
      !coercibleFormats.includes(originalFormat)
    ) {
      return null
    }

    if (specialOutputFormats.includes(ImageExtension.AVIF)) {
      return ImageExtension.AVIF
    }
    // If avif isn't available, try to use webp
    else if (specialOutputFormats.includes(ImageExtension.WEBP)) {
      return ImageExtension.WEBP
    }
    // Coerce pngs and tiffs without alpha channels to jpg
    else if (!this.originalMetadata.hasAlpha && ([ImageExtension.PNG, ImageExtension.TIFF].includes(originalFormat))) {
      return ImageExtension.JPG
    }

    return null
  }

  /**
   * Gets the original image from an Amazon S3 bucket.
   */
  async getInputObject(): Promise<GetObjectCommandOutput> {
    const s3 = new S3Client({});

    const imageLocation: GetObjectCommandInput = {Bucket: this.bucketDetails.name, Key: decodeURIComponent(this.key)}
    const request = s3.send(new GetObjectCommand(imageLocation))
    return await request
  }

  /**
   * Adjusts the input query parameters based on the context of this request
   * @param params - input query parameters
   */
  normalizeQueryParams(params: QueryStringParameters = {}): QueryStringParameters {
    const normalizedParams = replaceAliases(params)
    let finalOutputFormat = this.getAutoFormat() ?? normalizedParams.fm ?? this.originalMetadata?.format ?? ImageExtension.JPEG
    if (finalOutputFormat) {
      finalOutputFormat = normalizeExtension(finalOutputFormat)
    }
    normalizedParams.fm = finalOutputFormat

    return normalizedParams
  }
}
