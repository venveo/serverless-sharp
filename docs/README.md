# Introduction

## What is Serverless Sharp?
Serverless Sharp is a self-hosted image processing solution that uses [Sharp](https://sharp.pixelplumbing.com/) by
 Pixel Plumbing. Serverless Sharp requires no database, no server, and no additional services beyond those offered by
 AWS.
 
## Who is this for?
This software is for people who want to optimize and run basic transformations (crop, scale, convert, etc) on images
 from an existing S3 bucket without running computationally expensive processes or servers or paying for expensive
 third-party services.

## How does it work?
After deploying this solution, you'll find yourself with a number of AWS resources (all priced based on usage rather
than monthly cost). The most important of which are:
- **AWS Lambda**: Pulls images from your S3 bucket, runs the transforms, and outputs the image from memory
- **API Gateway**: Acts as a public gateway for requests to your Lambda function
- **Cloudfront Distribution**: Caches the responses from your API Gateway so the Lambda function doesn't re-execute

Once deployed, a Cloudfront distribution is generated that is directed to the generated API Gateway. This distribution
ensures the Lambda function does not get run multiple times for the same image request.
