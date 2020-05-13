# Quick Start

We'll go over installation, basic configuration, and deployment

## Prerequisites

- AWS Account
- Serverless
- NodeJs 12.x

Once you have installed Serverless for your environment, follow this guide to connect your Serverless installation to
 your AWS account:
 
 [Serverless.com: AWS Lambda Guide - Credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/)

## Installation

### Step 1: Clone

Clone the latest version of the project into a directory of your choice:

```git
git clone -b 'v2.0.6' --single-branch --depth 1 https://github.com/venveo/serverless-sharp.git 
```

<Note type="tip">

Always check the [releases page](https://github.com/venveo/serverless-sharp/releases) to make sure you're cloning the
 latest version.

</Note>

### Step 2: Configure

Enter the directory you cloned the project into and copy the `settings.example.yml` file to `settings.mysite.yml`

Open the file and make the appropriate configuration changes. At the very minimum, configure the `SOURCE_BUCKET
` property to your S3 bucket where the source images live. For example: `images.mysite.com`


### Step 3: Deploy

```shell-session
serverless deploy --settings settings.mysite.yml
```
