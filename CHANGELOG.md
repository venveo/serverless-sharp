# Changelog

## Unreleased
### Added
- Added support for AVIF output with `auto=format`

### Fixed
- Fix quality parameter (`q`) not being respected with `auto=format`
- Fix bug with `lossless` parameter not being respected

### Changed
- Optimized usage of Sharp by reusing previously created instances more often
- If browsers support AVIF, it will become the preferred output format for "auto=format" instead of webp

## [2.1.1] - 2021-03-31
### Changed
- Updated to Sharp 0.28.0

## [2.1.0] - 2021-03-24

### Added
- Adds ACM_CERTIFICATE_ARN configuration variable (@tyrauber)

### Changed
- ImageRequest exceptions now throw S3Exception instead of generic Error (@marco-primiceri)
- No longer require serverless-apiw-binary and serverless-apigwy-binary (@tyrauber)
- Responses now include a Last-Modified header with the generation time for an image (@tyrauber)
- Security hash is no longer case-sensitive
- Index function now always returns a response to support middleware applications (@tyrauber)
- Lambda timeout increased from default (6 seconds) to 10 seconds
- Improve CI workflow (@dashmug)
- Update to Sharp 0.27.2
- Update Lambda runtime to Node 14
- Removed Serverless Offline plugin due to lack of Node 14 compatibility

### Fixed
- Fix potential issue processing font expectations (@tyrauber)
- Properly capture S3 exceptions (@marco-primiceri)
- pngquant was not working properly
- fit=max was not working properly (@kylecotter)
- Fix config for custom CloudFormation Outputs. (@dashmug)
- Don't process SVGs in format=auto (@kylecotter)

## [2.0.6] - 2020-05-13

### Fixed
- Fixed bug where an image that is rotated with EXIF data loses its rotation (#67)

## [2.0.5] - 2020-05-04

No changes

## [2.0.4] - 2020-05-04

No changes

## [2.0.3] - 2020-05-04

### Fixed
- Fixed bug with Serverless not excluding dev-dependencies and failing to deploy due to large file size
- Fixed bug with Sharp binaries (Thanks @bs-thomas) (#63)

## [2.0.3] - 2020-05-04

### Added
- Started new docs!
- Add `SLS_VALID_PATH_REGEX` setting to explicitly control what paths are allowed (Thanks @bs-thomas) (#52)
- Add support for deploying to custom region (#61)
- Added support for SSL & custom domain (Thanks @bs-thomas) (#47)
- Added `DEFAULT_CACHE_CONTROL` to allow settings a cache control value when one isn't set on the source object
- Added `settings.js` helper

### Fixed
- Error that could occur when cropping via focalpoint and a non-integer is encountered
- Errors would always return 500 instead of correct error code (#45)

## Changed
- Update platform from Node 10 to Node 12 (#59)
- Update Sharp from 0.23.4 to 0.25.2
- The proper response code is now returned on error
- checkHash now throws a 400 HashException when a security hash is not present
- Update Standard from 14.3.1 to 14.3.3
- Update Serverless from 1.60.5 to 1.69.0
- Update serverless-offline from 5.12.1 to 6.1.4
- Update Jest from 24.9.0 to 25.5.4
- Update aws-sdk from 2.600.0 to 2.668.0
- Update aws-sdk-mock from 4.5.0 to 5.1.0

## [2.0.2] - 2020-02-04

### Changed
- Improved speed of input buffering for `pngquant` by skipping compression

### Added
- `pngquant` speed can now be configured in settings, defaults to fastest speed

### Fixed
- `fill-color` for hex color codes now supports 3-,4-,6-, and 8-digit formats
- Incoming image size limitations can now be configured and enforced with environment variables, preventing large images
from timing out

## [2.0.1] - 2020-01-09

### Changed
- Sharp is now bundled as its own layer, removing the need for swapping between platforms for local development
- Updated to latest version of Sharp (0.23.4)

### Added
- Added support for `ar` param, allowing an aspect ratio (16:9) to be supplied

### Fixed
- Fixed a potential bug with automatic webp formatting in non-webp-supporting browsers

## [2.0.0] - 2019-12-09

### Changed
- A breaking change has been introduced in the way URLs are generated. Previously we were calling `encodeURIComponent`
on each part of the requested URL, we are now calling a modified `encodeURIComponent` that excludes some characters to
be compliant with Imgix's official php SDK:
```php
$path = preg_replace_callback("/([^\w\-\/\:@])/", function ($match) {
    return rawurlencode($match[0]);
}, $path);
```

See https://locutus.io/php/url/rawurlencode/ for details
 
### Added
- Added environment variable `SLS_IGNORE` with default value of `favicon.ico` 

## Fixed
- Issue with Imgix compatibility regarding URL encoding. See Changed section

## [1.0.2] - 2019-12-09
### Added
- Added support for `dpr`

### Changed
- Updated dependencies
- Added MIT license
- Values outside of explicit rule min and max will now normalize to that min or max

## [1.0.1] - 2019-11-21
### Fixed
- Fixed an error in RegEx hex color matching that could cause some colors to fail (#0000)

## [1.0.0] - 2019-10-25
### Release
- Initial stable release

## [1.0.0-beta.2] - 2019-08-31
### Changed
- Update Imgix schema 11.0.0 -> 11.1.1
- Security will now allow images without security hashes to passthrough if there are no edits

### Fixed
- Fixed issue where errors wouldn't properly pass-through to image

## [1.0.0-beta.1] - 2019-08-27
### Added
- Changelog

### Changed
- Dropped support for the `MAX_OUTPUT_HEIGHT` and `MAX_OUTPUT_WIDTH` to better adhere to the schema.json spec
- Remove unused dependency `serverless-plugin-simulate` to resolve security issue

### Fixed
- Ensure all file extensions are switched to lowercase before processing
