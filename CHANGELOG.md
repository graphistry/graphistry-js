# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## Dev

### Added

* **client-api**: Add `resetFilters` and `resetExclusions` calls, requires minimum Graphistry version 2.42.18
* **client-api**: Add `playUpdates` observer which creates event when graph simulation completes
* **client-api-react**: Add `onPlayComplete` callback property

## 5.1.4 - 2025-05-29

### Added

* **client-api-react**: Add `pointStrokeWidth` and `showCollections` bindings

### Security

- Strip logs from client API authentication code

### Fix

* **client-api**: Fixed selectionUpdates by filtering out messages with the same selection, preventing unnecessary callbacks from hover events

## 5.1.3 - 2025-05-16

### Fix

* **client-api-react**: Fixed issues with ESM and UMD builds to ensure they work correctly when imported directly in a browser
* **client-api-react**: Updated `react` and `react-dom` dev dependency version to match peer dependency version
* **client-api-react**: Add `queryParamExtra` property to add arbitrary query parameters to Graphistry iframe

## 5.1.2 - 2025-05-10

### Fix

* **client-api**: Add missing menu URL parameter to iframe generation

## 5.1.1 - 2024-03-22

### Fix

* **client-api**: Add missing classes to documentation

## 5.1.0 - 2024-03-15

### Added

* **client-api**: Add API-key-based `ClientPKey` upload client
* **client-api-react**: Add API-key-based `ClientPKey` upload client
* **node-api**: Add API-key-based `ClientPKey` upload client
* **js-upload-api**: Add API-key-based `ClientPKey` upload client

### Refactor

* Factor out base class `AbstractClient` and add type export of `ClientType`

## 5.0.2 - 2024-02-13

### Added

* **client-api**: Gracefully ignore null values passed to `togglePanel`, `addFilter`, `addExclusion`
* **client-api**: Added `setTogglePanel`

### Fix

* **client-api-react**: Fix `filters`, `filter`, `exclusions`, `exclusion` to run again

## 5.0.1 - 2024-02-05

### Security

- Disable Storybook telemetry

### Fix

- Storybook docs: Basepath determined by being Graphistry Github (=> Hub) else uses the serving basepath

### Docs

- Storybook: `@graphistry/client-api-react` dynamic clustering demo

## 5.0.0 - 2024-02-02

### Added

- **client-api**: `toggleClustering(isOn)` to start/stop clustering

### Infra

- Update Storybook from 6 to 7

### Security

- Update dependencies

### Fix

- **client-api**: `tickClustering(milliseconds)` now works, requires Graphistry server upgrade

## 4.6.1

### Added
**js-upload-api**: Public helper `fetchToken()`

### Fix
**js-upload-api**: Upload config checks now pass when a token is used instead of creds

## 4.6.0

### Added

- **js-upload-api**: CommonJS support with output binaries at `dist/cjs`
- **node-api**: CommonJS support with output binaries at `dist/cjs`
- **all**: Optional orgs login

### Docs

- **all**: Arrow uploads and login modes

## 4.5.0 - 2023-03-23

### Added
- **js-upload-api**: Apache Arrow upload support
- **js-upload-api**: Privacy settings support
- **js-upload-api**: `Client::setToken()` for passing in existing JWT tokens

### Change
- **node-api**: Refactor to importing from `js-upload-api` vs previous code clone
- **node-api**: Refactor exports (non-breaking)

### Docs
- **js-upload-api**: Methods point to examples

### Fix
- **js-upload-api**: Throw error if invalid credentials
- **js-upload-api**: Throw error if file upload has an unrecognized format

## 4.2.0 - 2022-10-29

### Fix

- **js-upload-api**: publish js-upload-api dist/
- **client-api**: avoid client-api/dist/dist nesting
- **client-api**: fix default import path typo
- **client-app**: Update Falcor to gain `uuid@9` upgrade to work around cra / webpack 5 bundler polyfill bugs (crypto, sessions)
- **client-app-react**: Update Falcor, `uuid@9` to work around cra / webpack 5 bundler polyfill bugs (crypto, sessions)
- **infra**: Extract node-api, js-upload-api dist/ folders

## 4.1.8 - 2022-09-01

### Infra
- **js-upload-api**: Drop unused production dependencies (all) - `debug`
- **js-upload-api**: Publish

## 4.1.7 - 2022-09-01

### Infra

- **node-api**: Update `node-fetch` dependency
- **node-api**: Dropped unused direct dependency on `debug`
- **node-api**: Loosened unnecessarily pinned dependencies to minor (`^`) - `rimraf`, `node-fetch`
- **gha**: Add `js-upload-api` to audit matrix + do as explicit matrix

## 4.1.6 - 2022-08-31

### Added
- **client-api**: `updateSetting()` options `"neighborhoodHighlight"`, `"neighborhoodHighlightHops"`, `"labelInspectorEnabled"`, `"labelShowActions"`
- **client-api-react**: React props `neighborhoodHighlight`, `neighborhoodHighlightHops`, `showLabelInspector`, `showLabelActions`,  
### Docs

- **Node**: Added data portion of row-oriented example
- **client-api-react**: Stories for new modes

## 4.1.3 - 2022-06-29

### Features

- **client-api**: api=3 uploads via top-level exports `Dataset`, `File`, `EdgeFile`, `NodeFile`, and `Client` - **js-upload-api**: Created environment-neutral upload API; node-api will soon switch to this, client-api already does
- **client-api**: Add single delayed retry during initialization
- **client-api**: Exposed rxjs helper `retryWhen`

### Changed

- **client-api**: Code reformat

### Fix

- **client-api**: Polyfill crypto-browserify; missed in recent update to webpack 5

## 4.1.2 - 2022-05-21

### Docs

- **client-api-react**: More React 18 docs

## 4.1.1 - 2022-05-21

### Features

- **client-api**: Support for webpack 5 by explicitly excluding crypto
- **client-api-react**: Support for webpack 5 by explicitly excluding crypto

### Docs

- **client-api-react**: CRA React 18 example

## 4.1.0 - 2022-05-20

### Breaking 🔥

- **Node:** `4.0.5`'s new `NodeFile`. `EdgeFile` constructors now passing `createOpts` to `File`, taking the position of previous incorrect `urlOpts` param
- **React:** Move CRA's `react-scripts` from `peerDependencies` to `devDependencies` so `npm audit --production` passes

### Changed

- Dependency updates (non-breaking)

### Docs

- **Node:** Example of file parse options like row-oriented json vs column-oriented
- **Node:** Examples of simple bindings, complex bindings, metadata, and url options

## 4.0.6 - 2022-05-19

### Docs

- **React:** Restructure `projects/cra-test` example to prioritize users (vs contributors)

## 4.0.5 - 2022-05-14

### Features

- **node-api**: Initial implementation of `@graphistry/node-api`

### Docs

- **node-api**: Initial implementation of `@graphistry/node-api` typedocs

### Fix

- **docs**: Work around storybook linking bugs

## 4.0.3 - 2022-05-14

### Docs

- **docs**: Link `@graphistry/node-api` from main docs

## 4.0.2 - 2022-05-12

### Infra

- CI badges
- Only publish docs on master merge
- Only run CI on project changes

### Bug Fixes

- .dockerignore includes nested node_modules

### Changed

- Dependency updates (non-breaking)

## 4.0.0

### Features

- **React:** Upgraded to hooks (v17)
- **React:** Unpinned, peer dependency, and optional externalization in binaries
- **React:** Added new experimental props and callers
- **tolerateLoadErrors:** React initial load continues even if some settings fail (default `true`)
- **RxJS:** Upgraded (v7)
- **RxJS:** Unpinned, peer dependency, and optional externalization in binaries
- React now a required peer dependency when used from client-api-react
- **Multiple format bundles**: `dist/index.{cjs,esm,iife}(.full?)(.min?).js` . Use `full` for inlined `rxjs`, `react`, `react-dom`, otherwise must supply.

### Infra

- **gha:** Automate build using github actions and docker
- **esbuild:** Faster build
- **docker:** Use buildkit caching and layering

### Bug Fixes

- **nodes proptype:** Set to `arrayOf([])` to work around webpack build crashes
- **props:** Changing props such as background no longer triggers a page reload
- **filters:** Demos run on a delay to avoid racy load issue

### Docs

- **CHANGELOG.md**: Only use root-level, removing project-level
- **storybook:**: Added storybook-based demos
- **gh pages:** New site at [graphistry.github.io/graphistry-js](https://graphistry.github.io/graphistry-js)

### Deprecated

- Removal of RxJS prototype dot chaining, replaced with composition (pipe). For interim backwards compatibility, old example usages will largely still work via interim backporting.
- Use of api=1 `apiKey` and corresponding upload methods are deprecated. Will be replaced with JWT methods (see REST API).

### Breaking 🔥

We expect no breaking changes for most users

Use of old chained rxjs calling pattern are deprecated: old demos still work, but not all rxjs operators are chainable, nor in nested use

- **Hooks:** Removed recompose in favor of hooks, pushing minimum React version to 16.8
- **React:** Removed `withClientAPI`; instead use `Graphistry` directly
- **React:** Changed styling override fields and behavior:
  - Removed `vizStyle`, `vizClassName`, `style`, `className`
  - Added `containerStyle`, `containerClassName`, `containerProps`
  - Added `iframeStyle`, `iframeClassName`, `iframeProps`

<a name="3.7.6"></a>

## [3.7.6](https://github.com/graphistry/graphistry-js/compare/v3.7.5...v3.7.6) (2020-11-06)

**Note:** Version bump only for package graphistry-js

<a name="3.7.5"></a>

## [3.7.5](https://github.com/graphistry/graphistry-js/compare/v3.7.4...v3.7.5) (2020-11-06)

**Note:** Version bump only for package graphistry-js

<a name="3.7.4"></a>

## [3.7.4](https://github.com/graphistry/graphistry-js/compare/v3.7.3...v3.7.4) (2020-11-06)

**Note:** Version bump only for package graphistry-js

<a name="3.7.3"></a>

## [3.7.3](https://github.com/graphistry/graphistry-js/compare/v3.7.1...v3.7.3) (2020-11-06)

### Features

- **containerized build:** client-api ([6fa934d](https://github.com/graphistry/graphistry-js/commit/6fa934d))

<a name="3.7.2"></a>

## [3.7.2](https://github.com/graphistry/graphistry-js/compare/v3.7.1...v3.7.2) (2020-11-06)

### Features

- **containerized build:** client-api ([6fa934d](https://github.com/graphistry/graphistry-js/commit/6fa934d))

<a name="3.6.0"></a>

# [3.6.0](https://github.com/graphistry/graphistry-js/compare/v3.5.0...v3.6.0) (2019-02-21)

### Features

- **iframe:** Propagate session parameter to the iframe url ([e443ae5](https://github.com/graphistry/graphistry-js/commit/e443ae5))
- **poi:** label toggle ([74bf15f](https://github.com/graphistry/graphistry-js/commit/74bf15f))

<a name="3.5.0"></a>

# [3.5.0](https://github.com/graphistry/graphistry-js/compare/v3.4.4...v3.5.0) (2018-10-18)

### Bug Fixes

- **revert bg control:** redundant with iframe control ([fd2161a](https://github.com/graphistry/graphistry-js/commit/fd2161a))

### Features

- **client-api:** expose edge curvature ([987ebe4](https://github.com/graphistry/graphistry-js/commit/987ebe4))
- **client-api-react:** expose more controls ([1180984](https://github.com/graphistry/graphistry-js/commit/1180984))

<a name="3.4.4"></a>

## [3.4.4](https://github.com/graphistry/graphistry-js/compare/v3.4.3...v3.4.4) (2018-07-11)

**Note:** Version bump only for package graphistry-js

<a name="3.4.3"></a>

## [3.4.3](https://github.com/graphistry/graphistry-js/compare/v3.4.2...v3.4.3) (2018-07-03)

### Bug Fixes

- **client-api-react:** use a weakmap to diff axes prop ([2858663](https://github.com/graphistry/graphistry-js/commit/2858663))

<a name="3.4.2"></a>

## [3.4.2](https://github.com/graphistry/graphistry-js/compare/v3.4.1...v3.4.2) (2018-07-03)

**Note:** Version bump only for package graphistry-js

<a name="3.4.1"></a>

## [3.4.1](https://github.com/graphistry/graphistry-js/compare/v3.4.0...v3.4.1) (2018-07-03)

### Bug Fixes

- **client-api-react:** fix client-api-react props invalidation checks ([57cab3e](https://github.com/graphistry/graphistry-js/commit/57cab3e))
