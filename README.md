# AWS Serverless Image Handler Lambda wrapper for SharpJS
A solution to dynamically handle images on the fly, utilizing Sharp (https://sharp.pixelplumbing.com/en/stable/).

## Who is this for?
This software is for people who want to optimize and transform (crop, scale, convert, etc) images from an existing S3 
bucket without running computationally expensive processes or servers or paying for expensive third-party services.

## How does it work?
After deploying this solution, you'll find yourself with a number of AWS resources (all priced based on usage rather 
than monthly cost). The most important of which are: 
- AWS Lambda function: Pulls images from your S3 bucket, runs the transforms, and outputs the image from memory
- API Gateway: Acts as a public gateway for requests to your Lambda function
- Cloudfront Distribution: Caches the responses from your API Gateway so the Lambda function doesn't re-execute

## Running Locally
This package uses Serverless to allow for local development by simulating API Gateway and Lambda.
1. `cd source/image-handler`
2. `npm install`
3. `cp .env.example .env`
4. Configure .env file
5. Ensure you have AWS CLI configured on your machine with proper access to the S3 bucket you're using in `.env`
6. Run `serverless offline`

## Deploying to AWS
First, we need to procure sharp/libvips binaries compiled for Amazon Linux. We can do this by running the following:

```
rm -rf node_modules/sharp && npm install --arch=x64 --platform=linux --target=8.10.0 sharp
``` 

This will remove any existing Sharp binaries and then reinstall them with Linux x64 in mind.

Ensure your `.env` file is properly configured as shown in the previous step

Run: `serverless deploy`
