# Configuration
Serverless Sharp stores its settings in YAML files. When deploying the application, you specify the YAML file and the
stage (your environment). For example:

```sh
serverless deploy --settings mysite.com.yml --stage prod
```

## Settings File Structure
We use YML files to make use of their inheritance. This allows us to define some defaults and then branch environment
-specific changes off of them. For example:


```yml
defaults: &defaults
  serviceName: image-handler-test
  offlinePort: 80
  region: 'us-east-1'
  environment: &defaults.environment
    DEFAULT_QUALITY: 75
    DEFAULT_COMPRESS_QUALITY: 45
    SLS_IGNORE: favicon.ico
    SLS_VALID_PATH_REGEX: '.*'
    MAX_IMAGE_WIDTH: 2000
    MAX_IMAGE_HEIGHT: 1000
    PNGQUANT_SPEED: 10
    DEFAULT_CACHE_CONTROL: 'max-age=2592000'

stages:
  dev:
    <<: *defaults
    environment:
      <<: *defaults.environment
      SOURCE_BUCKET: 'my-bucket/prefix/path'
      SECURITY_KEY: ''
      CUSTOM_DOMAIN: ''
  prod:
    <<: *defaults
    environment:
      <<: *defaults.environment
      SOURCE_BUCKET: 'random-string-here'
      SECURITY_KEY: ''
      CUSTOM_DOMAIN: 'my.domain.com'

```

## Environment Settings
The majority of the application and environment specific settings are configured as environment variables that are
 passed into the Lambda service handler.
 
 ### `DEFAULT_QUALITY`
 
 - Type: `integer`
 - Default: `75`
 
 A number between 1 and 100 representing the default image quality.

### `DEFAULT_COMPRESS_QUALITY`

- Type: `integer`
- Default: `75`

A number between 1 and 100 for the default quality when an image is requested to be compressed

### `SLS_IGNORE`

- Type: `string`
- Default: ``

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

### `MAX_IMAGE_WIDTH`

- Type: `integer`
- Default: `2000`

Images may not be requested with a width larger than this value

### `MAX_IMAGE_HEIGHT`

- Type: `integer`
- Default: `2000`

Images may not be requested with a height larger than this value

### `PNGQUANT_SPEED`

- Type: `integer`
- Default: `10`

The speed value to pass to the `pngquant` optimization program. From the [pngquant website](https://pngquant.org/):

> Speed/quality trade-off from 1 (brute-force) to 10 (fastest). The default is 3. Speed 10 has 5% lower quality, but is 8 times faster than the default.

### `DEFAULT_CACHE_CONTROL`

- Type: `string`
- Default: ``

By default, Serverless Sharp will serve responses with the same Cache-Control header as the object being served. If
 the Cache-Control header is not set, this value will be used.


### `SOURCE_BUCKET`

- Type: `string`
- Default: ``

### `SECURITY_KEY`

- Type: `string`
- Default: ``

### `CUSTOM_DOMAIN`

- Type: `string`
- Default: ``

> **NOTE:** This requires deployment in the `us-east-1` region!
