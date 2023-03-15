#!/bin/bash
set -e

# Usage: ./tools/node-tsdocs.sh
# Emits projects/node-api tsdocs HTML (live source) to ./docs-build/node-tsdocs

rm -rf docs-build/node-tsdocs
mkdir -p docs-build/node-tsdocs
docker run --rm \
    --entrypoint=/bin/sh \
    -w=/opt/graphistry-js/projects/node-api \
    -v `pwd`/docs-build/node-tsdocs:/opt/graphistry-js/projects/node-api/docs \
    graphistry/graphistry-js:latest -c "npm run docs:build"

ls -alh docs-build/node-tsdocs/index.html
find docs-build/node-tsdocs
