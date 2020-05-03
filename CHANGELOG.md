# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- Add `SLS_VALID_PATH_REGEX` setting to explicitly control what paths are allowed (Thanks @bs-thomas) (#52)
- Add support for deploying to custom region (#61)

### Fixed
- Error that could occur when cropping via focalpoint and a non-integer is encountered
- Errors would always return 500 instead of correct error code

## Changed
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
