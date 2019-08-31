# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
