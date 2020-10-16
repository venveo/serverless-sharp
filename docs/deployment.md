# Deployment

## New Deployment
Ensure your settings yml file is properly configured as shown in the Quick Start and Configuration sections

Run: `serverless deploy [--stage=dev] [--settings=settings.yml]`

If you need to deploy using a specific AWS profile, you should run:

`AWS_SDK_LOAD_CONFIG=true serverless deploy [--stage=dev] [--settings=settings.yml] --aws-profile PROFILE_NAME `

## Deploying Updates

Keeping your Serverless stacks up to date is critical to ensuring you have the fewest bugs and most secure
 environment. We follow [Semantic Versioning](https://semver.org/) to help users understand compatibility and changes.
 
### Updating Serverless Sharp
Start by downloading the latest code that's compatible with your previous version (check your package.json file to
 see the current version.) 
 
Once you've downloaded the new version and ensured you've made any necessary configuration changes, you have two
 options:
 
 1) You can simply run the standard deployment:
 
 ```shell script
sls deploy --settings ./settings.yml --stage <stage>
``` 

This will deploy the entire application.
