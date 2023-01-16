import { describe, expect, test, beforeEach, afterEach } from 'vitest'

import ImageRequest from "./ImageRequest";
import {calculateHash} from "./utils/security";
import type {GenericHttpInvocationEvent} from "./types/common";

import { mockClient } from "aws-sdk-client-mock";
import {S3Client, GetObjectCommand, GetObjectCommandOutput} from "@aws-sdk/client-s3"
import * as fs from "fs";
import path from "path";

describe('Testing ImageRequest', () => {
  const OLD_ENV = process.env
  const s3Mock = mockClient(S3Client);

  const testJpegPath = '../../../data/tests/SampleJPGImage_500kbmb.jpg';
  const testJpegWidth = 1792;
  const testJpegHeight = 1792;
  const testJpegSize = 512017;


  const processRequest = async (event: GenericHttpInvocationEvent, imagePath: string = testJpegPath, contentType = 'image/jpg'): Promise<ImageRequest> => {
    imagePath = path.resolve(__dirname, imagePath);
    const imageRequest = new ImageRequest(event)

    const testJpegStream = fs.createReadStream(imagePath)
    const response: GetObjectCommandOutput = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Body: testJpegStream,
      ContentType: contentType,
      $metadata: {}
    }
    s3Mock.on(GetObjectCommand).resolves(response);
    await imageRequest.process();
    return imageRequest
  }

  beforeEach(() => {
    process.env = {...OLD_ENV}
    delete process.env.NODE_ENV

    process.env.SECURITY_KEY = ''
    process.env.SOURCE_BUCKET = 'assets.test.com/some/prefix'

    s3Mock.reset()
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test('Can CreateImageRequest', () => {
    const event: GenericHttpInvocationEvent = {
      headers: {},
      path: '/some/prefix/images/my-object.png',
      queryParams: {}
    }

    process.env.SECURITY_KEY = ''
    process.env.SOURCE_BUCKET = 'assets.test.com/some/prefix'

    const request = new ImageRequest(event)
    const bucketDetails = request.bucketDetails

    expect(bucketDetails.name).toEqual('assets.test.com')
    expect(bucketDetails.prefix).toEqual('some/prefix')
    expect(request.key).toEqual('some/prefix/images/my-object.png')
  })

  test('Can CreateImageRequest - with hash (valid)', () => {
    const event = {
      path: '/some/prefix/images/my-object.png',
      headers: {},
      queryParams: {
        s: ''
      }
    }
    process.env.SECURITY_KEY = '12345asdf'
    process.env.SOURCE_BUCKET = 'assets.test.com/some/prefix'
    event.queryParams.s = calculateHash(event.path, event.queryParams, process.env.SECURITY_KEY)

    const request = new ImageRequest(event)
    const bucketDetails = request.bucketDetails

    expect(bucketDetails.name).toEqual('assets.test.com')
    expect(bucketDetails.prefix).toEqual('some/prefix')
    expect(request.key).toEqual('some/prefix/images/my-object.png')
  })

  test('Process Request - Input JPG', async () => {
    const event: GenericHttpInvocationEvent = {
      path: '/some/prefix/images/my-object.png',
      headers: {},
      queryParams: {}
    }



    const request = await processRequest(event)
    // Ensure input image matches known values
    expect(request.originalMetadata?.format).toEqual('jpeg');
    expect(request.originalMetadata?.width).toEqual(testJpegWidth);
    expect(request.originalMetadata?.height).toEqual(testJpegHeight);
    expect(request.originalMetadata?.size).toEqual(testJpegSize);
  })


  test('GetAutoFormat - JPG to WEBP', async () => {
    const event: GenericHttpInvocationEvent = {
      path: '/some/prefix/images/my-object.png',
      queryParams: {
        auto: 'format'
      },
      headers: {
        'accept': 'image/webp'
      }
    }
    const request = await processRequest(event)
    // Ensure input image matches known values
    expect(request.getAutoFormat()).toEqual('webp');
  })


  // We accept AVIF and WEBP - AVIF should be preferred
  test('GetAutoFormat - JPG to AVIF', async () => {
    const event: GenericHttpInvocationEvent = {
      path: '/some/prefix/images/my-object.png',
      queryParams: {
        auto: 'format'
      },
      headers: {
        'accept': 'image/webp,image/avif'
      }
    }
    const request = await processRequest(event)
    // Ensure input image matches known values
    expect(request.getAutoFormat()).toEqual('avif');
  })


  test('GetAutoFormat - PNG (no alpha) to JPG', async () => {
    const event: GenericHttpInvocationEvent = {
      path: '/some/prefix/images/my-object.png',
      queryParams: {
        auto: 'format'
      },
      headers: {}
    }
    const request = await processRequest(event, '../../../data/tests/PNG_demonstration_1_no_alpha.png', 'image/png')
    // Ensure input image matches known values
    expect(request.getAutoFormat()).toEqual('jpg');
  })
})
