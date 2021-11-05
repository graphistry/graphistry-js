This project use automatic changelog management, so development is a bit different:

## Docs

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

## Docker

### Build

```bash
docker-compose build
```

### Run

```bash
docker-compose run --rm graphistry-js
```

or

```bash
docker run --rm -it graphistry/graphistry:latest
```

=>

```
root@8f18f077e0b6:/opt/graphistry-js#
```

### Output - outdated

`./tools/extract-dist.sh` => `dist/client-api[-react]/{dist,docs,es,lib,examples}`

Will copy from `graphistry/graphistry-js:latest` into folder `DIST_PATH=dist`

You may want to run `docker rm graphistry-js-tmp` if a stale container


## Native - outdated

Notes:
* We're deprecating tool-driven conventional commits so git raw commands will be (mostly) OK
* Moving to [GHA-driven check + publish](https://dev.to/xaviercanchal/automatic-versioning-in-a-lerna-monorepo-using-github-actions-4hij)


### Install 

```bash
nvm use 10.9.0  #12 is broken (rc-tools -> gulp -> ...)

npm install

npm run bootstrap
```

(revert `projects/*/package.json` if they get wiped out)

### Build

```bash
npm run build
```

### To Push Code to a Branch

1. Create a branch as usual, e.g., with jira ticket name

2. When commiting, use strict commit style:

```bash
npm run commit
```

This will create a commit message guaranteed to follow Conventional Commit format: https://conventionalcommits.org/

Push branch to github as usual

### Merge Branch into Master

1. Make a PR

2. When merging PR, do "Rebase and Merge" option (if no conflicts) via github dropdown

### Publish for public consumption (Maintainer only)

1. Follow above build steps

2. Ensure git + npm auth

3. npm run deploy

This will update the changelog, push that to github, and then lerna publish


### Update downstream (Maintainer only)

Most likely, you want to update version dependencies in:

* pivot-app
* viz-app
