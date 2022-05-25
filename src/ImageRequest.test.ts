/* eslint-env jest */
import ImageRequest from "./ImageRequest";
import HashException from "./errors/HashException";
import {calculateHash} from "./utils/security";
import {GenericInvocationEvent} from "./types/common";

import { mockClient } from "aws-sdk-client-mock";
import {S3Client, GetObjectCommand, GetObjectCommandOutput} from "@aws-sdk/client-s3"
import * as fs from "fs";
import path from "path";
import {PathLike} from "fs";

describe('Testing ImageRequest', () => {
  const OLD_ENV = process.env
  const s3Mock = mockClient(S3Client);

  const testJpegPath = path.resolve(__dirname, '../data/tests/SampleJPGImage_500kbmb.jpg');
  const testJpegWidth = 1792;
  const testJpegHeight = 1792;
  const testJpegSize = 512017;


  const processRequest = async (event: GenericInvocationEvent, imagePath: PathLike = testJpegPath): Promise<ImageRequest> => {

    const imageRequest = new ImageRequest(event)

    const testJpegStream = fs.createReadStream(imagePath)
    const response: GetObjectCommandOutput = {
      Body: testJpegStream,
      ContentType: 'image/jpg',
      $metadata: {}
    }
    s3Mock.on(GetObjectCommand).resolves(response);
    await imageRequest.process();
    return imageRequest
  }

  beforeEach(() => {
    jest.resetModules()
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
    const event: GenericInvocationEvent = {
      path: '/some/prefix/images/my-object.png'
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

  test('Can CreateImageRequest - with hash (invalid)', () => {
    const event = {
      path: '/some/prefix/images/my-object.png',
      queryParams: {
        s: ''
      }
    }
    process.env.SECURITY_KEY = '12345asdf'
    process.env.SOURCE_BUCKET = 'assets.test.com/some/prefix'

    const hash = 'password'

    event.queryParams.s = hash

    expect(() => {
      new ImageRequest(event)
    }).toThrow(HashException)
  })

  test('Process Request - Input JPG', async () => {
    const event: GenericInvocationEvent = {
      path: '/some/prefix/images/my-object.png'
    }



    const request = await processRequest(event)
    // Ensure input image matches known values
    expect(request.originalMetadata?.format).toEqual('jpeg');
    expect(request.originalMetadata?.width).toEqual(testJpegWidth);
    expect(request.originalMetadata?.height).toEqual(testJpegHeight);
    expect(request.originalMetadata?.size).toEqual(testJpegSize);
  })


  test('GetAutoFormat - JPG to WEBP', async () => {
    const event: GenericInvocationEvent = {
      path: '/some/prefix/images/my-object.png',
      queryParams: {
        auto: 'format'
      },
      headers: {
        'Accept': 'image/webp'
      }
    }
    const request = await processRequest(event)
    // Ensure input image matches known values
    expect(request.getAutoFormat()).toEqual('webp');
  })


  // We accept AVIF and WEBP - AVIF should be preferred
  test('GetAutoFormat - JPG to AVIF', async () => {
    const event: GenericInvocationEvent = {
      path: '/some/prefix/images/my-object.png',
      queryParams: {
        auto: 'format'
      },
      headers: {
        'Accept': 'image/webp,image/avif'
      }
    }
    const request = await processRequest(event)
    // Ensure input image matches known values
    expect(request.getAutoFormat()).toEqual('avif');
  })
})
