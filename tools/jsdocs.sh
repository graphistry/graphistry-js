#!/bin/bash
set -e

# Usage: ./tools/jsdocs.sh
# Emits projects/client-api jsdocs HTML (live source) to ./docs-build/jsdocs

VERSION=$(cat projects/client-api/package.json | jq -r .version)

rm -rf docs-build/jsdocs
mkdir -p docs-build/jsdocs
docker run --rm \
    --entrypoint=/bin/sh \
    -w=/opt/graphistry-js/projects/client-api \
    -v `pwd`/projects/client-api/jsdoc-conf.json:/opt/graphistry-js/projects/client-api/jsdoc-conf.json:ro \
    -v `pwd`/projects/client-api/src:/opt/graphistry-js/projects/client-api/src:ro \
    -v `pwd`/docs-build/jsdocs:/opt/graphistry-js/projects/client-api/jsdocs/@graphistry/client-api/${VERSION} \
    graphistry/graphistry-js:latest -c "./node_modules/.bin/jsdoc -c jsdoc-conf.json -p package.json --pedantic -R README.md -d ./jsdocs"

ls -alh docs-build/jsdocs/index.html
find docs-build/jsdocs
