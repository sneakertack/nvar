# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2018-02-20
### Added
- Add `override` configuration option, which controls whether variables that are already pre-existing in the environment should be overriden or not.

## [1.2.4] - 2017-08-19
### Changed
- Adjusted test script commands.

### Fixed
- Restore running of tests on Travis CI (broken since ad42abd532d1628c75b6f9bddeca36181c3846a3).

## [1.2.3] - 2017-08-07
### Added
- Add a copy of the most recent tests results to `tests/`.
- Include license file with the repository.

## [1.2.2] - 2017-08-04
### Added
- Add integration with Coveralls.
- Add an overall functional test.

### Changed
- Throw an error if the module encounters an unexpected character during variable declaration.

## [1.2.1] - 2017-08-03
### Added
- API section in the readme, which details options and defaults.

### Removed
- Made package slightly leaner by removing tests and metafiles during install.

## [1.2.0] - 2017-08-02
### Added
- Support Node.js runtimes down till v0.10.0 (via transpilation down to ES5 during install, runtimes >= v6 will still load the ES2015+ source directly).

### Changed
- Module no longer depends on `fs` until it needs to load a file.

## [1.1.0] - 2017-08-01
### Added
- Add `enoent` option, to specify whether to throw, warn, or do nothing if the envfile was not found. The default is to warn if no path was specified (defaulting to `.env`), and throw if a path was explicitly specified.
- Add a basic Travis configuration.
- Add words to readme.

### Changed
- nvar will only warn and no longer throw an error by default when called in its simplest form (i.e. `require('nvar')()` without any arguments) and a `.env` envfile was not found.

## [1.0.3] - 2017-07-30
### Fixed
- Implement string argument shorthand that was advertised in readme but overlooked during development.

## [1.0.2] - 2017-07-30
### Added
- This changelog, with descriptions starting from v1.0.0.

## [1.0.1] - 2017-07-28
### Changed
- Minor touchup to Readme only.

## [1.0.0] - 2017-07-27
### Added
- Initial release. It supports:
  - Reading configuration from a file `path` (`./.env` by default), or directly passed in as `source`.
  - Assignment to any arbitrary `target` (`process.env` by default).
  - Parsing support for the following shell-isms:
    - Unquoted values
    - Optional 'export' prefixes.
    - Comments with `#`.
    - Single-quoted values (Strong quoting)
    - Double-quoted values (Weak quoting)
    - Backslash-newline line splitting
    - Backslash-escaping of special characters
    - Parameter expansion
