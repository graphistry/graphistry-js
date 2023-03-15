#!/bin/bash
set -e

# Usage: ./tools/storybook.sh
# Emits projects/client-api-react storybook HTML to ./docs-build

rm -rf ./docs-build
mkdir -p docs-build
docker run --rm \
    --entrypoint=/bin/sh \
    -w=/opt/graphistry-js/projects/client-api-react \
    -v `pwd`/docs-build:/opt/graphistry-js/projects/client-api-react/docs-build \
    graphistry/graphistry-js:latest -c "npm run build-storybook"
