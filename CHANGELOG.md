# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Update Imgix schema 11.0.0 -> 11.1.1

## [1.0.0-beta.1] - 2019-08-27
### Added
- Changelog

### Changed
- Dropped support for the `MAX_OUTPUT_HEIGHT` and `MAX_OUTPUT_WIDTH` to better adhere to the schema.json spec
- Remove unused dependency `serverless-plugin-simulate` to resolve security issue

### Fixed
- Ensure all file extensions are switched to lowercase before processing
