#!/bin/bash
set -e

# Usage: ./tools/jsdocs.sh
# Emits projects/client-api jsdocs HTML to ./docs-build/jsdocs

VERSION=$(cat projects/client-api/package.json | jq -r .version)

rm -rf docs-build/jsdocs
mkdir -p docs-build/jsdocs
docker run --rm \
    --entrypoint=/bin/bash \
    -w=/opt/graphistry-js/projects/client-api \
    -v `pwd`/docs-build/jsdocs:/opt/graphistry-js/projects/client-api/jsdocs/@graphistry/client-api/${VERSION} \
    graphistry/graphistry-js:latest -c "./node_modules/.bin/jsdoc -c jsdoc-conf.json -p package.json --pedantic -R README.md -d ./jsdocs"

ls -alh docs-build/jsdocs/index.html
find docs-build/jsdocs
