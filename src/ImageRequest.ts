import sharp from "sharp";

import {
  getAcceptedImageFormatsFromHeaders,
  extractObjectKeyFromUri,
  extractBucketNameAndPrefix
} from "./utils/httpRequestProcessor";
import {getSchemaForQueryParams, normalizeAndValidateSchema, replaceAliases} from "./utils/schemaParser";
import {verifyHash} from "./utils/security";
import {getSetting} from "./utils/settings";
import HashException from "./errors/HashException";
import {
  BucketDetails,
  GenericHeaders,
  ParameterTypesSchema,
  QueryStringParameters,
  ParsedSchemaItem,
  GenericInvocationEvent, ParsedEdits
} from "./types/common";

import {GetObjectCommandInput, GetObjectCommandOutput, GetObjectCommand, S3Client} from "@aws-sdk/client-s3"
import {Stream} from "stream";

export default class ImageRequest {
  bucketDetails: BucketDetails

  key: string
  event: GenericInvocationEvent

  originalImageObject: GetObjectCommandOutput | null = null;
  inputObjectStream: Stream | null = null;
  inputObjectSize: number | null = null;

  readonly sharpPipeline: sharp.Sharp;
  originalMetadata: sharp.Metadata | null = null;
  schema: ParameterTypesSchema | null = null;
  edits: ParsedEdits | null = null;
  headers: GenericHeaders | null = null;

  constructor(event: GenericInvocationEvent) {
    this.event = event
    // If the hash isn't set when it should be, we'll throw an error.
    if (getSetting('SECURITY_KEY')) {
      this.ensureHash()
    }

    this.bucketDetails = extractBucketNameAndPrefix(getSetting('SOURCE_BUCKET'))

    const path = event.path
    this.key = extractObjectKeyFromUri(path, this.bucketDetails.prefix)
    this.sharpPipeline = sharp().rotate()
  }

  /**
   * This method does a number of async things, such as getting the image object and building a schema
   */
  async process(): Promise<void> {
    this.originalImageObject = await this.getInputObject()

    this.inputObjectStream = this.originalImageObject?.Body as Stream
    this.inputObjectSize = this.originalImageObject.ContentLength ?? null

    // Pipe the body Stream from S3 to our sharp pipeline
    this.inputObjectStream.pipe(this.sharpPipeline)

    this.originalMetadata = await this.sharpPipeline.metadata()
    // TODO: This is redundant. Remove it.
    this.headers = this.event.headers ?? null

    const queryParams = this.event.queryParams ? this.normalizeQueryParams(this.event.queryParams) : null

    this.schema = queryParams ? getSchemaForQueryParams(queryParams) : null
    this.edits = (this.schema && queryParams) ? normalizeAndValidateSchema(this.schema, queryParams) : null
  }

  getAutoFormat() {
    if (!this.headers || !this.originalMetadata || this.originalMetadata.format === undefined) {
      return null;
    }
    // TODO: Use enums here
    const coercibleFormats = ['jpg', 'png', 'webp', 'avif', 'jpeg', 'tiff']
    let autoParam = null
    if (this.event.queryParams && this.event.queryParams.auto) {
      autoParam = this.event.queryParams.auto
    }
    const specialOutputFormats = getAcceptedImageFormatsFromHeaders(this.headers)

    if (
      !autoParam ||
      !autoParam.includes('format') ||
      !coercibleFormats.includes(this.originalMetadata.format)
    ) {
      return null
    }

    // TODO: Use enum here
    if (specialOutputFormats.includes('avif')) {
      return 'avif'
    }
    // If avif isn't available, try to use webp
    // TODO: Use enum here
    else if (specialOutputFormats.includes('webp')) {
      return 'webp'
    }
    // Coerce pngs and tiffs without alpha channels to jpg
    // TODO: Use enum here
    else if (!this.originalMetadata.hasAlpha && (['png', 'tiff'].includes(this.originalMetadata.format))) {
      return 'jpeg'
    }

    return null
  }

  /**
   * Gets the original image from an Amazon S3 bucket.
   */
  async getInputObject(): Promise<GetObjectCommandOutput> {
    const s3 = new S3Client({
      region: 'us-east-1'
    });

    const imageLocation: GetObjectCommandInput = {Bucket: this.bucketDetails.name, Key: decodeURIComponent(this.key)}
    const request = s3.send(new GetObjectCommand(imageLocation))
    return await request
    // try {
    //   const originalImage = await request
    //   return Promise.resolve(originalImage)
    // } catch (err) {
    // const error = new S3Exception(err.statusCode, err.code, err.message)
    // return Promise.reject(error)
    // TODO: Add S3 error back here once you figure out the type
    // return Promise.reject()
    // }
  }

  /**
   * Parses the name of the appropriate Amazon S3 key corresponding to the
   * original image.
   *
   * Throws a HashException if the hash is invalid or not present when it needs to be.
   */
  ensureHash(): void {
    const {queryParams, path} = this.event
    if (queryParams && queryParams.s === undefined) {
      throw new HashException()
    }
    if (queryParams) {
      const hash = queryParams.s
      const isValid = verifyHash(path, queryParams, hash)
      if (!isValid) {
        throw new HashException()
      }
    }
  }

  /**
   *
   * @param params
   */
  normalizeQueryParams(params: QueryStringParameters = {}): QueryStringParameters {
    if (!params) {
      params = {}
    }
    const normalizedParams = replaceAliases(params)
    normalizedParams.fm = this.getAutoFormat() ?? normalizedParams.fm ?? this.originalMetadata?.format ?? null

    return normalizedParams
  }
}
