# Graphistry JavaScript API Architecture

## Monorepo

Lerna with eslint & esbuild drives two npm packages:

* `graphistry-client`: rxjs-based vanilla reactive JS API with minimal dependencies
* `graphistry-client-react`: React wrapper around `graphistry-client`

## Libraries

We strive to keep the libraries compatible across RxJS and React versions:

* `graphistry-client`: Bundles its own tree-shaken `rxjs` version, and it is unpinned so you can also reuse in your own packages. No `react` dependency. For convenience, we reexport a minimal useful set of `rxjs` methods.
* `graphistry-client-react`: Depends on `graphistry-client`, including for any use of `rxjs`. Version of `react` is unpinned.

## Automated

Builds are containerized, including for local dev, and automated via github actions

## JSDocs & Storybook

Docs are automated via JSDocs (`graphistry-client`) and Storybook (`graphistry-client` + `graphistry-client-react`)

They auto-publish to [graphistry.github.io/graphistry-js](https://graphistry.github.io/graphistry-js/) as branch [#docs](https://github.com/graphistry/graphistry-js/tree/docs)

## Bundled

Both libraries bundle into multiple formats (esm, cjs, iife) as part of the npm publish

Every Graphistry enterprise release hosts the coordinated JS library versions