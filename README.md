# Serverless Sharp Image Processor
A solution to dynamically optimize and transform images on the fly, utilizing [Sharp](https://sharp.pixelplumbing.com/en/stable/) and AWS Lambda.

[Documentation](https://venveo.github.io/serverless-sharp/index.html)

Brought to you by [Venveo](https://www.venveo.com)

## Who is this for?
This software is for people who want to optimize and run basic transformations (crop, scale, convert, etc) on images from an existing S3
bucket without running computationally expensive processes or servers or paying for expensive third-party services.

Serverless Sharp is a drop-in replacement for most essential features of Imgix and costs magnitudes less for
most users.

## How does it work?
After deploying this solution, you'll find yourself with a number of AWS resources (all priced based on usage rather
than monthly cost). The most important of which are:
- **AWS Lambda**: Pulls images from your S3 bucket, runs the transforms, and outputs the image from memory
- **API Gateway**: Acts as a public gateway for requests to your Lambda function
- **Cloudfront Distribution**: Caches the responses from your API Gateway so the Lambda function doesn't re-execute

Once deployed, a Cloudfront CDN distribution is generated that is directed to the generated API Gateway. This distribution
ensures the Lambda function does not get run multiple times for the same image request.

## Running Locally
This package uses Serverless to allow for local development by simulating API Gateway and Lambda.
1. `npm ci`
2. `cp settings.example.yml settings.yml`
3. Configure settings.yml file
4. Ensure you have AWS CLI configured on your machine with proper access to the S3 bucket you're using in your settings.
5. Run `serverless offline`
