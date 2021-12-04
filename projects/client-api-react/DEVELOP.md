# @graphistry/client-api-react Developer Guide

## Architecture

*`esbuild` (and `rollup` + `babel` for `umd`) + `eslint`
* multiple output targets for embedded and standalone use
* see root instructions for containerized + storybook

## Build

Uses `esbuild` for most, `rollup` for `umd`:

```bash
npm run build
# -> dist/index.{cjs,iife,esm,umd}.js
# -> dist/index.full.{cjs,iife,esm}.js
```

The `index.full.*.js` variants inline `React` for standalone use, while the main variant relies on linking to an externally provided version by the embedding environment.

## Regenerate package lock

```bash
npm run lock:fix
```