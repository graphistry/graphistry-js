#!/bin/bash
set -e

DIST_PATH=${DIST_PATH:-dist}
CONTAINER_NAME=${CONTAINER_NAME:-graphistry-js-tmp}
IMAGE_NAME=${IMAGE_NAME:-graphistry/graphistry-js}

echo "===================="
echo "="
echo "=  extract-dist.sh"
echo "="
echo "===================="
echo "Extracting JS binaries from graphistry/graphistry-js:latest into path ${DIST_PATH}"
echo
echo "---------------"
echo
echo "Settings:"
echo "  DIST_PATH: $DIST_PATH"
echo "  CONTAINER_NAME: $CONTAINER_NAME"
echo "  IMAGE_NAME: $IMAGE_NAME"
echo
echo "---------------"
echo

echo "1. Cleanup ${DIST_PATH}/client-api[-react]"
rm -rf ${DIST_PATH}/client-api 
rm -rf ${DIST_PATH}/client-api-react
mkdir -p ${DIST_PATH}/client-api
mkdir -p ${DIST_PATH}/client-api-react

echo "2. Create container $CONTAINER_NAME from image $IMAGE_NAME if needed"
if [ ! "$(docker ps -a | grep $CONTAINER_NAME)" ]; then
    echo "... No container '$CONTAINER_NAME', create"    
    docker create -it --name "$CONTAINER_NAME" "$IMAGE_NAME" bash
fi

echo "3. Copy distro files from container '$CONTAINER_NAME' to path '$DIST_PATH'"
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api/dist ${DIST_PATH}/client-api/dist
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api/docs ${DIST_PATH}/client-api/docs
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api/es   ${DIST_PATH}/client-api/es
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api/lib  ${DIST_PATH}/client-api/lib
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api/examples ${DIST_PATH}/client-api/examples
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api-react/dist ${DIST_PATH}/client-api-react/dist
#docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api-react/docs ${DIST_PATH}/client-api-react/docs
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api-react/es   ${DIST_PATH}/client-api-react/es
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api-react/lib  ${DIST_PATH}/client-api-react/lib
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api-react/examples ${DIST_PATH}/client-api-react/examples

echo "4. Clean up container '$CONTAINER_NAME"
docker rm -f graphistry-js-tmp

echo
echo "==============="
echo "="
echo "=  Success!"
echo "="
echo "==============="
echo "Successfully extracted JS binaries into folder $DIST_PATH"
echo
echo "---------------"
echo
echo "[[ Exported folders ]]"
du -h --max-depth=2 dist
echo
echo "---------------"
echo
echo "[[ Generated JS binaries ]]"
du -ah $DIST_PATH | grep "client-api/dist\|client-api-react/dist"
echo
echo "Successfully exiting with return code 0"
exit 0