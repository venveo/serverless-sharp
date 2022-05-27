import sharp from "sharp";

import {
  extractBucketNameAndPrefix,
  extractObjectKeyFromUri,
  getAcceptedImageFormatsFromHeaders
} from "./utils/httpRequestProcessor";
import {getSchemaForQueryParams, normalizeAndValidateSchema, replaceAliases} from "./utils/schemaParser";
import {verifyHash} from "./utils/security";
import {getSetting} from "./utils/settings";
import HashException from "./errors/HashException";
import {
  BucketDetails,
  GenericInvocationEvent,
  ImageExtensions,
  ParameterTypesSchema,
  ParsedEdits,
  QueryStringParameters
} from "./types/common";

import {GetObjectCommand, GetObjectCommandInput, GetObjectCommandOutput, S3Client} from "@aws-sdk/client-s3"
import {Stream} from "stream";
import {normalizeExtension} from "./utils/formats";

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

  constructor(event: GenericInvocationEvent) {
    this.event = event
    // If the hash isn't set when it should be, we'll throw an error.
    if (getSetting('SECURITY_KEY')) {
      this.ensureHash()
    }

    this.bucketDetails = extractBucketNameAndPrefix(getSetting('SOURCE_BUCKET'))
    this.key = extractObjectKeyFromUri(event.path, this.bucketDetails.prefix)
    this.sharpPipeline = sharp().rotate()
  }

  /**
   * This method does a number of async things, such as getting the image object and building a schema
   */
  async process(): Promise<void> {
    this.originalImageObject = await this.getInputObject()

    this.inputObjectStream = <Stream>this.originalImageObject?.Body
    this.inputObjectSize = this.originalImageObject.ContentLength ?? null

    // Pipe the body Stream from S3 to our sharp pipeline
    this.inputObjectStream.pipe(this.sharpPipeline)

    this.originalMetadata = await this.sharpPipeline.metadata()

    // It's important that we normalize the query parameters even if none are provided
    // we'll take this opportunity to determine the proper output format for the image
    const queryParams = this.normalizeQueryParams(this.event.queryParams ?? {})

    this.schema = queryParams ? getSchemaForQueryParams(queryParams) : null
    this.edits = (this.schema && queryParams) ? normalizeAndValidateSchema(this.schema, queryParams) : null
  }

  /**
   * Determines the best compatible output format for the input request, taking into account "Accept" headers, image
   * transparency, and typical format sizes.
   */
  getAutoFormat() {
    if (!this.originalMetadata || this.originalMetadata.format === undefined) {
      return null;
    }
    const originalFormat = <ImageExtensions>normalizeExtension(this.originalMetadata.format)

    const headers = this.event.headers ?? {}
    const coercibleFormats = [ImageExtensions.JPEG, ImageExtensions.PNG, ImageExtensions.WEBP, ImageExtensions.AVIF, ImageExtensions.JPG, ImageExtensions.TIFF]
    let autoParam = null
    if (this.event.queryParams && this.event.queryParams.auto) {
      autoParam = this.event.queryParams.auto
    }
    const specialOutputFormats = getAcceptedImageFormatsFromHeaders(headers)

    if (
      !autoParam ||
      !autoParam.includes('format') ||
      !coercibleFormats.includes(originalFormat)
    ) {
      return null
    }

    // TODO: Use enum here
    if (specialOutputFormats.includes(ImageExtensions.AVIF)) {
      return ImageExtensions.AVIF
    }
    // If avif isn't available, try to use webp
    // TODO: Use enum here
    else if (specialOutputFormats.includes(ImageExtensions.WEBP)) {
      return ImageExtensions.WEBP
    }
    // Coerce pngs and tiffs without alpha channels to jpg
    // TODO: Use enum here
    else if (!this.originalMetadata.hasAlpha && ([ImageExtensions.PNG, ImageExtensions.TIFF].includes(originalFormat))) {
      return 'jpeg'
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
    const normalizedParams = replaceAliases(params)
    normalizedParams.fm = this.getAutoFormat() ?? normalizedParams.fm ?? this.originalMetadata?.format ?? null

    return normalizedParams
  }
}
