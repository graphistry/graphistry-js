This project use automatic changelog management, so development is a bit different:

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

### Output

`./tools/extract-dist.sh` => `dist/client-api[-react]/{dist,docs,es,lib,examples}`

Will copy from `graphistry/graphistry-js:latest` into folder `DIST_PATH=dist`



## Native

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
