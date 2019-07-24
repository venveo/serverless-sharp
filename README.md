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
TODO


## Running unit tests for customization
* Clone the repository, then make the desired code changes
* Next, run unit tests to make sure added customization passes the tests
```
cd ./deployment
chmod +x ./run-unit-tests.sh  \n
./run-unit-tests.sh \n
```

## Building distributable for customization
* Configure the bucket name of your target Amazon S3 distribution bucket
```
export TEMPLATE_OUTPUT_BUCKET=my-bucket-name # bucket where cfn template will reside
export DIST_OUTPUT_BUCKET=my-bucket-name # bucket where customized code will reside
export VERSION=my-version # version number for the customized code
```
_Note:_ You would have to create 2 buckets, one named 'my-bucket-name' and another regional bucket named 'my-bucket-name-<aws_region>'; aws_region is where you are testing the customized solution. Also, the assets  in bucket should be publicly accessible.

```
* Clone the github repo
```bash
git clone https://github.com/awslabs/serverless-image-handler.git
```

* Navigate to the deployment folder
```bash
cd serverless-image-handler/deployment
```

* Now build the distributable
```bash
sudo ./build-s3-dist.sh $DIST_OUTPUT_BUCKET $TEMPLATE_OUTPUT_BUCKET $VERSION
```

* Deploy the distributable to an Amazon S3 bucket in your account. Note: you must have the AWS Command Line Interface installed.
```bash
aws s3 cp ./dist/ s3://$DIST_OUTPUT_BUCKET-[region_name]/serverless-image-handler/$VERSION/ --recursive --exclude "*" --include "*.zip"
aws s3 cp ./dist/serverless-image-handler.template s3://$TEMPLATE_OUTPUT_BUCKET/serverless-image-handler/$VERSION/
```
_Note:_ In the above example, the solution template will expect the source code to be located in the my-bucket-name-[region_name] with prefix serverless-image-handler/my-version/serverless-image-handler.zip

* Get the link of the serverless-image-handler.template uploaded to your Amazon S3 bucket.
* Deploy the Serverless Image Handler solution to your account by launching a new AWS CloudFormation stack using the link of the serverless-image-handler.template
```bash
https://s3.amazonaws.com/my-bucket-name/serverless-image-handler/my-version/serverless-image-handler.template
```

Building for Lambda:
```
rm -rf node_modules/sharp
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs8.10 npm install
```
