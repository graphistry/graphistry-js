# `@graphistry/node-api` Developer Docs


## Main SDLC

Currently setup primarily for local uncontainerized use. Docs & CI already flow uses GHA/containers. 

### Install

`npm i`

When using from `projects/node-api-test`, first run `lerna bootstrap` from the monorepo root to link `node-api` into `node-api-test`'s `node_modules/`

### Build

* `npm run build` converts `src/*.ts` into node.js-runnable `dist/*.js`
* `npm run watch` does this continuously

### Update

`npm run lock:fix`, maybe with `rm package-lock.json`

### Test

* `npm run test` currently just lints and ensures docs build
* CI will do roughly the same, with more building

### Publish

* Include release notes in monorepo-wide changelog
* Publishes to npm as part of monorepo-wide publish
* Docs publish as part of monorepo-wide docs publish during PR landing

## Docs

### Build

* `npm run docs:build` generates `docs/`

### Live watchers

* `npm run docs:watch` live-generates `docs/`
* `npm run docs:start` launches a browser with live updates on `docs/`

### Publish

* Part of monorepo's GHA `storybook.yml` that publishes on PR merge to main