#FROM node:15.1-buster-slim
FROM node:10.9.0-slim

WORKDIR /opt/graphistry-js

COPY lerna.json package.json ./
RUN echo "=== Installing build tools ===" \
    && npm install

COPY projects/client-api/package.json /opt/graphistry-js/projects/client-api/package.json
COPY projects/client-api-react/package.json /opt/graphistry-js/projects/client-api-react/package.json
RUN echo "=== Installing and linking project dependencies ===" \
    && npm run bootstrap

COPY projects/client-api /opt/graphistry-js/projects/client-api
RUN echo "=== Building client-api ===" \
    && ./node_modules/lerna/bin/lerna.js run build --scope="@graphistry/client-api"

COPY projects/client-api-react /opt/graphistry-js/projects/client-api-react
RUN echo "=== Building client-api-react ===" \
    && ./node_modules/lerna/bin/lerna.js run build --scope="@graphistry/client-api-react"

ENTRYPOINT [ "/bin/bash" ]