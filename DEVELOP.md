# GraphistryJS Developer Docs

## TL;DR

Docker compose (`docker compose` or `docker-compose`, with or without `sudo`):

```bash
./dc build
./dc up storybook # http://localhost:6006
```

and

```bash
docker-compose run --rm --entrypoint=/usr/local/bin/node graphistry-js ./node_modules/lerna/dist/cli.js run lint
```

# Docs

We use Storybook for React, plugged into github pages

See [Deploy Storybook to GitHub Pages](https://dev.to/kouts/deploy-storybook-to-github-pages-3bij) for a great tutorial:

* Storybook builds get checked into branch `docs` and hosted at [graphistry.github.io/graphistry-js](https://graphistry.github.io/graphistry-js)

* For local development:

```bash
docker compose build
docker compose up storybook
# http://localhost:6006
# All demos work except uploads
```

* To mimic gha building:

```bash
docker compose build
./tools/storybook.sh
./tools/jsdocs.sh
```

=>

```
./docs-build         # storybook
./docs-build/jsdocs  # jsdocs
```

# Example dev setup for `client-api` / `react-client-api`

Terminal A
 - `cd projects/client-api`
 - `npm link @graphistry/client-api`
 - `npm run build:esm:min:full:watch`

Terminal B
 - `cd projects/client-api-react`
 - `npm link @graphistry/client-api-react`
 - `npm link @graphistry/client-api`
 - `npm run build:rollup-watch`

Terminal C
 - `cd projects/cra-test`
 - `npm link @graphistry/client-api-react`
 - `npm start`

# Docker

## Environment

Enable buildkit for Docker and docker compose plugin, such as in your `.profile`:

```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

For convenience, we setup `./dc` to do `docker compose` commands this for you, such as `./dc build`

## Build

```bash
docker compose build
```

## Run

```bash
docker compose run --rm graphistry-js
```

or

```bash
docker run --rm -it graphistry/graphistry:latest
```

=>

```
root@8f18f077e0b6:/opt/graphistry-js#
```

## Extract binaries

You can build natively to get per-project binaries (see below), or via docker:

`./tools/extract-dist.sh` => `projects/client-api[-react]/dist`

This copies from `graphistry/graphistry-js:latest` into host project folders

You may want to run `docker rm graphistry-js-tmp` if a stale container

## Native

```bash
apt get install jq
npm install
npm run bootstrap
npm run build
npm run lint
( cd projects/client-api-react && ./node_modules/.bin/start-storybook -p 6006 )
# => http://localhost:6006/
```

## Dependencies

We use `package-lock.json` as part of aiding reproducibility

Make sure you have a recent `node` and `npm` -- we have not containerized these steps yet

To regenerate:
- go to a project or the root level
- run `npm run lock:fix`
- check in the updated `package-lock.json`


# Publish for public consumption (Maintainer only)

0. Login to npm: `npm login`

1. Build from a local checkout of branch with a corresponding PR:

Ex:

```bash
./dc build
./tools/extract-dist.sh
```

2. Ensure git clean (`git status`) + npm auth (`npm login`)

3. Publish:

```bash
lerna version X.Y.Z-alpha.2
lerna publish #  if failed: lerna publish from-package
```

As an even bigger hammer, to update even unchanged dependencies, try `lerna publish X.Y.Z --force-publish`

4. Merge the PR in github

This publishes ghpages

5. Most likely, you also want to update version dependencies in:

* pivot-app
* viz-app
