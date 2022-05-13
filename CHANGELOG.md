# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.



# Development

### Features

* **node-api**: Initial implementation of `@graphistry/node-api`

### Docs

* **node-api**: Initial implementation of `@graphistry/node-api` typedocs

# Latest

## 4.0.2 - 2022-05-12

### Infra
* CI badges
* Only publish docs on master merge
* Only run CI on project changes

### Bug Fixes

* .dockerignore includes nested node_modules

### Changed

* Dependency updates (non-breaking)

## 4.0.0

### Features

* **React:** Upgraded to hooks (v17)
* **React:** Unpinned, peer dependency, and optional externalization in binaries
* **React:** Added new experimental props and callers
* **tolerateLoadErrors:** React initial load continues even if some settings fail (default `true`)
* **RxJS:** Upgraded (v7)
* **RxJS:** Unpinned, peer dependency, and optional externalization in binaries
* React now a required peer dependency when used from client-api-react
* **Multiple format bundles**: `dist/index.{cjs,esm,iife}(.full?)(.min?).js` . Use `full` for inlined `rxjs`, `react`, `react-dom`, otherwise must supply.

### Infra

* **gha:** Automate build using github actions and docker
* **esbuild:** Faster build
* **docker:** Use buildkit caching and layering

### Bug Fixes

* **nodes proptype:** Set to `arrayOf([])` to work around webpack build crashes
* **props:** Changing props such as background no longer triggers a page reload
* **filters:** Demos run on a delay to avoid racy load issue

### Docs

* **CHANGELOG.md**: Only use root-level, removing project-level
* **storybook:**: Added storybook-based demos
* **gh pages:** New site at [graphistry.github.io/graphistry-js](https://graphistry.github.io/graphistry-js)

### Deprecated

* Removal of RxJS prototype dot chaining, replaced with composition (pipe). For interim backwards compatibility, old example usages will largely still work via interim backporting.
* Use of api=1 `apiKey` and corresponding  upload methods are deprecated. Will be replaced with JWT methods (see REST API).

### Breaking Changes

We expect no breaking changes for most users

Use of old chained rxjs calling pattern are deprecated: old demos still work, but not all rxjs operators are chainable, nor in nested use

* **Hooks:** Removed recompose in favor of hooks, pushing minimum React version to 16.8
* **React:** Removed `withClientAPI`; instead use `Graphistry` directly
* **React:** Changed styling override fields and behavior:
  * Removed `vizStyle`, `vizClassName`, `style`, `className`
  * Added `containerStyle`, `containerClassName`, `containerProps`
  * Added `iframeStyle`, `iframeClassName`, `iframeProps`



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

* **containerized build:** client-api ([6fa934d](https://github.com/graphistry/graphistry-js/commit/6fa934d))




<a name="3.7.2"></a>
## [3.7.2](https://github.com/graphistry/graphistry-js/compare/v3.7.1...v3.7.2) (2020-11-06)


### Features

* **containerized build:** client-api ([6fa934d](https://github.com/graphistry/graphistry-js/commit/6fa934d))




<a name="3.6.0"></a>
# [3.6.0](https://github.com/graphistry/graphistry-js/compare/v3.5.0...v3.6.0) (2019-02-21)


### Features

* **iframe:** Propagate session parameter to the iframe url ([e443ae5](https://github.com/graphistry/graphistry-js/commit/e443ae5))
* **poi:** label toggle ([74bf15f](https://github.com/graphistry/graphistry-js/commit/74bf15f))




<a name="3.5.0"></a>
# [3.5.0](https://github.com/graphistry/graphistry-js/compare/v3.4.4...v3.5.0) (2018-10-18)


### Bug Fixes

* **revert bg control:** redundant with iframe control ([fd2161a](https://github.com/graphistry/graphistry-js/commit/fd2161a))


### Features

* **client-api:** expose edge curvature ([987ebe4](https://github.com/graphistry/graphistry-js/commit/987ebe4))
* **client-api-react:** expose more controls ([1180984](https://github.com/graphistry/graphistry-js/commit/1180984))




<a name="3.4.4"></a>
## [3.4.4](https://github.com/graphistry/graphistry-js/compare/v3.4.3...v3.4.4) (2018-07-11)




**Note:** Version bump only for package graphistry-js

<a name="3.4.3"></a>
## [3.4.3](https://github.com/graphistry/graphistry-js/compare/v3.4.2...v3.4.3) (2018-07-03)


### Bug Fixes

* **client-api-react:** use a weakmap to diff axes prop ([2858663](https://github.com/graphistry/graphistry-js/commit/2858663))




<a name="3.4.2"></a>
## [3.4.2](https://github.com/graphistry/graphistry-js/compare/v3.4.1...v3.4.2) (2018-07-03)




**Note:** Version bump only for package graphistry-js

<a name="3.4.1"></a>
## [3.4.1](https://github.com/graphistry/graphistry-js/compare/v3.4.0...v3.4.1) (2018-07-03)


### Bug Fixes

* **client-api-react:** fix client-api-react props invalidation checks ([57cab3e](https://github.com/graphistry/graphistry-js/commit/57cab3e))
