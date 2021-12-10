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

* To mimic gha building:

```bash
docker compose build
./tools/storybook.sh
./tools/jsdocs.sh
```

=>

```
./docs-build  # storybook
./docs-build  # jsdocs
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

## Native

```bash
npm install
npm run bootstrap
npm run build
( cd projects/client-api-react && ./node_modules/.bin/start-storybook -p 6006 )
# => http://localhost:6006/
```


## Native - outdated

### Publish for public consumption (Maintainer only)

1. Follow above build steps

2. Ensure git + npm auth

3. npm run deploy

This will update the changelog, push that to github, and then lerna publish


### Update downstream (Maintainer only)

Most likely, you want to update version dependencies in:

* pivot-app
* viz-app
