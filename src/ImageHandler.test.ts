/* eslint-env jest */
import ImageRequest from "./ImageRequest";
import {GenericInvocationEvent} from "./types/common";

import {mockClient} from "aws-sdk-client-mock";
import {GetObjectCommand, GetObjectCommandOutput, S3Client} from "@aws-sdk/client-s3"
import * as fs from "fs";
import path from "path";
import ImageHandler from "./ImageHandler";
import sharp from "sharp";
import {PathLike} from "fs";

describe('Testing ImageHandler', () => {
  const OLD_ENV = process.env
  const s3Mock = mockClient(S3Client);

  const testJpegPath = path.resolve(__dirname, '../data/tests/SampleJPGImage_500kbmb.jpg');
  const testJpegWidth = 1792;
  const testJpegHeight = 1792;
  const testJpegSize = 512017;

  beforeEach(() => {
    jest.resetModules()
    process.env = {...OLD_ENV}

    // Add some defaults here
    process.env.SECURITY_KEY = ''
    process.env.SOURCE_BUCKET = 'assets.test.com/some/prefix'

    delete process.env.NODE_ENV
    s3Mock.reset()
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  const processRequestAndGetMetadata = async (event: GenericInvocationEvent, imagePath: PathLike = testJpegPath) => {

    const imageRequest = new ImageRequest(event)

    const testJpegStream = fs.createReadStream(imagePath)
    const response: GetObjectCommandOutput = {
      Body: testJpegStream,
      ContentType: 'image/jpg',
      $metadata: {}
    }
    s3Mock.on(GetObjectCommand).resolves(response);
    await imageRequest.process();
    const imageHandler = new ImageHandler(imageRequest)
    const output = await imageHandler.process();
    // Convert the base64 body to a buffer
    const buffer = Buffer.from(output.Body, "base64");

    return await (sharp(buffer)).metadata()
  }

  test('Process Image - Input JPG - Original', async () => {
    const event: GenericInvocationEvent = {
      path: 'irrelevant.jpg'
    }
    const metadata = await processRequestAndGetMetadata(event)
    expect(metadata).toBeDefined()
    // Ensure input image matches known values
    expect(metadata.format).toEqual('jpeg');
    expect(metadata.width).toEqual(testJpegWidth);
    expect(metadata.height).toEqual(testJpegHeight);
    expect(metadata.size).toBeLessThanOrEqual(testJpegSize);
  })

  /**
   * Inputting only a single dimension should maintain aspect ratio
   */
  test('Process Image - Input JPG - Width Only', async () => {
    const event: GenericInvocationEvent = {
      path: 'irrelevant.jpg',
      queryParams: {
        width: '250'
      }
    }
    const metadata = await processRequestAndGetMetadata(event)
    expect(metadata).toBeDefined()
    // Ensure input image matches known values
    expect(metadata.format).toEqual('jpeg');
    expect(metadata.width).toEqual(250);
    expect(metadata.height).toEqual(testJpegWidth / testJpegHeight * 250);
    expect(metadata.size).toBeLessThanOrEqual(testJpegSize);
  })

  /**
   * Inputting width and height should maintain the same aspect ratio, scaling to fit the smallest dimension
   */
  test('Process Image - Input JPG - Width & Height Only', async () => {
    const event: GenericInvocationEvent = {
      path: 'irrelevant.jpg',
      queryParams: {
        width: '250',
        height: '500',
      }
    }
    const metadata = await processRequestAndGetMetadata(event)
    expect(metadata).toBeDefined()
    // Ensure input image matches known values
    expect(metadata.format).toEqual('jpeg');
    // The input image is square, so the output should be the smallest input dimension for both width & height
    expect(metadata.width).toEqual(250);
    expect(metadata.height).toEqual(250);
    expect(metadata.size).toBeLessThanOrEqual(testJpegSize);
  })

  /**
   * The image should be cropped to fit the input dimensions
   */
  test('Process Image - Input JPG - Width & Height - Crop', async () => {
    const event: GenericInvocationEvent = {
      path: 'irrelevant.jpg',
      queryParams: {
        width: '250',
        height: '500',
        fit: 'crop'
      }
    }
    const metadata = await processRequestAndGetMetadata(event)
    expect(metadata).toBeDefined()
    // Ensure input image matches known values
    expect(metadata.format).toEqual('jpeg');
    // The input image is square, so the output should be the smallest input dimension for both width & height
    expect(metadata.width).toEqual(250);
    expect(metadata.height).toEqual(500);
    expect(metadata.size).toBeLessThanOrEqual(testJpegSize);
  })

  /**
   * Input jpg output png
   */
  test('Process Image - Input JPG - Output PNG', async () => {
    const event: GenericInvocationEvent = {
      path: 'irrelevant.jpg',
      queryParams: {
        fm: 'png'
      }
    }
    const metadata = await processRequestAndGetMetadata(event)
    expect(metadata).toBeDefined()
    // Ensure input image matches known values
    expect(metadata.format).toEqual('png');
    // The input image is square, so the output should be the smallest input dimension for both width & height
    expect(metadata.width).toEqual(testJpegWidth);
    expect(metadata.height).toEqual(testJpegHeight);
  })

  /**
   * Input jpg output png
   */
  test('Process Image - Input JPG - Output WEBP', async () => {
    const event: GenericInvocationEvent = {
      path: 'irrelevant.jpg',
      queryParams: {
        fm: 'webp'
      }
    }
    const metadata = await processRequestAndGetMetadata(event)
    expect(metadata).toBeDefined()
    // Ensure input image matches known values
    expect(metadata.format).toEqual('webp');
    // The input image is square, so the output should be the smallest input dimension for both width & height
    expect(metadata.width).toEqual(testJpegWidth);
    expect(metadata.height).toEqual(testJpegHeight);
  })
})
