This project use automatic changelog management, so development is a bit different:

## Install 

npm install

npm run bootstrap

## Build

npm run build

## To Push Code to a Branch

1. Create a branch as usual, e.g., with jira ticket name

2. When commiting, use strict commit style:

npm run commit

This will create a commit message guaranteed to follow Conventional Commit format: https://conventionalcommits.org/

Push branch to github as usual

## Merge Branch into Master

1. Make a PR

2. When merging PR, do "Rebase and Merge" option (if no conflicts) via github dropdown

## Publish for public consumption (Maintainer only)

npm run deploy

This will update the changelog, push that to github, and then lerna publish


## Update downstream (Maintainer only)

Most likely, you want to update version dependencies in:

* pivot-app
* viz-app
