#!/bin/bash
set -e

CONTAINER_NAME=${CONTAINER_NAME:-graphistry-js-tmp}
IMAGE_NAME=${IMAGE_NAME:-graphistry/graphistry-js}
DIST_CLIENT_API=${DIST_CLIENT_API:-projects/client-api}
DIST_CLIENT_API_REACT=${DIST_CLIENT_API_REACT:-projects/client-api-react}
DIST_NODE_API=${DIST_NODE_API:-projects/node-api}
DIST_JS_UPLOAD_API=${DIST_JS_UPLOAD_API:-projects/js-upload-api}

echo "===================="
echo "="
echo "=  extract-dist.sh"
echo "="
echo "===================="
echo "Extracting JS binaries from graphistry/graphistry-js:latest into path projects/{client,node}-api[-react]/dist"
echo " (DIST_CLIENT_API, DIST_CLIENT_API_REACT, DIST_NODE_API)"
echo
echo "---------------"
echo
echo "Settings:"
echo "  CONTAINER_NAME: $CONTAINER_NAME"
echo "  IMAGE_NAME: $IMAGE_NAME"
echo "  DIST_CLIENT_API: $DIST_CLIENT_API"
echo "  DIST_CLIENT_API_REACT: $DIST_CLIENT_API_REACT"
echo "  DIST_NODE_API: $DIST_NODE_API"
echo "  DIST_JS_UPLOAD_API: $DIST_JS_UPLOAD_API"
echo
echo "---------------"
echo

echo "1. Recreate container $CONTAINER_NAME from image $IMAGE_NAME as needed"
if [ "$(docker ps -a | grep $CONTAINER_NAME)" ]; then
    #echo "... No container '$CONTAINER_NAME', create"
    echo "Removing contaier"
    docker rm --name "$CONTAINER_NAME"
fi
echo "Creating container"
docker create -it --name "$CONTAINER_NAME" "$IMAGE_NAME" bash    

echo "2. Copy distro files from container '$CONTAINER_NAME' to path '$DIST_PATH'"
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api/dist ${DIST_CLIENT_API}
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/client-api-react/dist ${DIST_CLIENT_API_REACT}
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/node-api/dist ${DIST_NODE_API}
docker cp graphistry-js-tmp:/opt/graphistry-js/projects/js-upload-api/dist ${DIST_JS_UPLOAD_API}

echo "3. Clean up container '$CONTAINER_NAME"
docker rm -f $CONTAINER_NAME

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
echo "[[ Generated JS binaries ]]"
du -ah $DIST_PATH | grep "client-api/dist\|client-api-react/dist|node-api/dist"
echo
echo "Successfully exiting with return code 0"
exit 0