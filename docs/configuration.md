# Configuration
Serverless Sharp stores its settings in YAML files. When deploying the application, you specify the YAML file and the
stage (your environment). For example:

```shell-session
serverless deploy --settings mysite.com.yml --stage prod
```

## Settings File Structure
We use YML files to make use of their inheritance. This allows us to define some defaults and then branch environment
-specific changes off of them. You can define multiple environments, each of which will inherit your default settings. 
This is useful if you have different buckets for staging & production. You may also wish to create an
 environment without a sign-key for local development. For example:

```yaml
defaults: &defaults
  serviceName: image-handler
  region: 'us-east-1'
  environment: &defaults.environment
    DEFAULT_QUALITY: 75
    DEFAULT_COMPRESS_QUALITY: 45
    SLS_IGNORE: favicon.ico
    SLS_VALID_PATH_REGEX: '.*'
    MAX_IMAGE_WIDTH: 2000
    MAX_IMAGE_HEIGHT: 1000
    PNGQUANT_SPEED: 10
    SOURCE_BUCKET: 'images.mydomain.com'
    DEFAULT_CACHE_CONTROL: 'max-age=2592000'

stages:
  dev:
    <<: *defaults
    environment:
      <<: *defaults.environment
      SECURITY_KEY: ''
      CUSTOM_DOMAIN: ''
      ACM_CERTIFICATE_ARN: ''
  prod:
    <<: *defaults
    environment:
      <<: *defaults.environment
      SECURITY_KEY: 'random-string-here'
      CUSTOM_DOMAIN: 'img.mydomain.com'
      ACM_CERTIFICATE_ARN: ''
```

## Environment Settings
The majority of the application and environment specific settings are configured as environment variables that are
 passed into the Lambda service handler.
 
 |Setting|Default|
 |-|-|
 |[CUSTOM_DOMAIN](#custom_domain)|*empty*|
 |[ACM_CERTIFICATE_ARN])(#acm_certificate_arn)|*empty*]
 |[DEFAULT_CACHE_CONTROL](#default_cache_control)|*empty*|
 |[DEFAULT_COMPRESS_QUALITY](#default_compress_quality)|75|
 |[DEFAULT_QUALITY](#default_quality)|75|
 |[MAX_IMAGE_HEIGHT](#max_image_height)|`2000`|
 |[MAX_IMAGE_WIDTH](#max_image_width)|`2000`|
 |[PNGQUANT_SPEED](#pngquant_speed)|`10`|
 |[SECURITY_KEY](#security_key)|*empty*|
 |[SOURCE_BUCKET](#source_bucket)|*empty*|
 |[SLS_IGNORE](#sls_ignore)|*empty*|
 |[SLS_VALID_PATH_REGEX](#sls_valid_path_regex)|`.*`|
 

### `CUSTOM_DOMAIN`

- Type: `string`
- Default: *empty*

If set, Serverless Sharp will generate an Amazon issued certificate for the domain and link it to your Cloudfront
 distribution.

<Note type="tip">

This requires deployment in the `us-east-1` region!

</Note>

<Note type="tip">

During deployment, you'll need to go into your Amazon ACM console and verify the domain.

</Note>

### `ACM_CERTIFICATE_ARN`
- type: `string`
- DEFAULT: *empty*

Use an existing ACM Certificate, by supplying the ACM Certificate Arn.

### `DEFAULT_CACHE_CONTROL`

- Type: `string`
- Default: *empty*

By default, Serverless Sharp will serve responses with the same Cache-Control header as the object being served. If
 the Cache-Control header is not set, this value will be used.

### `DEFAULT_COMPRESS_QUALITY`

- Type: `integer`
- Default: `75`

A number between 1 and 100 for the default quality when an image is requested to be compressed

 ### `DEFAULT_QUALITY`
 
 - Type: `integer`
 - Default: `75`
 
 
### `MAX_IMAGE_HEIGHT`

- Type: `integer`
- Default: `2000`

Images may not be requested with a height larger than this value

### `MAX_IMAGE_WIDTH`

- Type: `integer`
- Default: `2000`

Images may not be requested with a width larger than this value

### `PNGQUANT_SPEED`

- Type: `integer`
- Default: `10`

The speed value to pass to the `pngquant` optimization program. From the [pngquant website](https://pngquant.org/):

> Speed/quality trade-off from 1 (brute-force) to 10 (fastest). The default is 3. Speed 10 has 5% lower quality, but is 8 times faster than the default.

### `SECURITY_KEY`

- Type: `string`
- Default: *empty*

If set, a hash must be provided as the `s` parameter in all requests. See [Security](/usage/security) for more.

### `SOURCE_BUCKET`

- Type: `string`
- Default: *empty*

The S3 bucket in your account where your images are stored - you can include a path here if you like. For example
: `mybucket/images`

This will tell Serverless to create an IAM role with access to all objects in the `mybucket` bucket with an object prefix
of `images`.

Serverless Sharp will then validate all requests to this prefix, if it doesn't start with that prefix, the system
 will automatically prepend it to the request. This means these requests are effectively equivalent:

`localhost/images/my-image.png`

`localhost/my-image.png`

### `SLS_IGNORE`

- Type: `string`
- Default: *empty*

A comma-delineated string of paths that should be ignored (for example, `favicon.ico`)

### `SLS_VALID_PATH_REGEX`

- Type: `Regular Expression`
- Default: `.*`

A regular expression for path validation. Allows you to explicitly control what assets may be handled by the Lambda
 function. If the request path fails this test, a 404 response will be served.

Example:
```yaml
# All requests must start with /images/
SLS_VALID_PATH_REGEX: ^\/images\/.*`
```
