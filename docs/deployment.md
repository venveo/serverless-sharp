# Deployment

Ensure your settings yml file is properly configured as shown in the Quick Start and Configuration sections

Run: `serverless deploy [--stage=dev] [--settings=settings.yml]`

If you need to deploy using a specific AWS profile, you should run:

`AWS_SDK_LOAD_CONFIG=true serverless deploy [--stage=dev] [--settings=settings.yml] --aws-profile PROFILE_NAME `
