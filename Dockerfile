FROM node:16.13.0-slim as base
WORKDIR /opt/graphistry-js
COPY lerna.json package.json package-lock.json ./
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm \
    && echo "=== Installing build tools ===" \
    && npm install
COPY \
    projects/client-api/package.json \
    projects/client-api/package-lock.json \
    /opt/graphistry-js/projects/client-api/
COPY \
    projects/client-api-react/package.json \
    projects/client-api-react/package-lock.json \
    /opt/graphistry-js/projects/client-api-react/
COPY \
    projects/js-upload-api/package.json \
    projects/js-upload-api/package-lock.json \
    /opt/graphistry-js/projects/js-upload-api/
# Rebuild esbuild due to exec format err: https://github.com/evanw/esbuild/issues/1223
RUN --mount=type=cache,target=/usr/src/app/.npm\
    echo "=== Installing and linking project dependencies ===" \
    && npm run bootstrap \
    && ( cd projects/client-api && npm rebuild esbuild ) \
    && ( cd projects/client-api-react && npm rebuild esbuild ) \
    && ( cd projects/js-upload-api && npm rebuild esbuild )

# Shared src
COPY \
    projects/js-upload-api/package.json \
    projects/js-upload-api/tsconfig.json \
    /opt/graphistry-js/projects/js-upload-api/
COPY \
    projects/js-upload-api/src \
    /opt/graphistry-js/projects/js-upload-api/src
RUN \
    echo "=== Building shared dep @graphistry/js-upload-api ===" \
    && cd /opt/graphistry-js/projects/js-upload-api \
    && npm run build

# #############################################################################

FROM base as base_js
WORKDIR /opt/graphistry-js
COPY projects/client-api /opt/graphistry-js/projects/client-api
RUN echo "=== Building client-api ===" \
    && ./node_modules/lerna/cli.js run build --scope="@graphistry/client-api"

# #############################################################################

FROM base_js as base_react
WORKDIR /opt/graphistry-js
COPY projects/client-api-react /opt/graphistry-js/projects/client-api-react
RUN echo "=== Building client-api-react ===" \
    && ./node_modules/lerna/cli.js run lint --scope="@graphistry/client-api-react" \
    && ./node_modules/lerna/cli.js run build --scope="@graphistry/client-api-react"

# #############################################################################

FROM base as base_node
WORKDIR /opt/graphistry-js
COPY projects/node-api /opt/graphistry-js/projects/node-api
RUN echo "=== Building node-api ===" \
    && ( cd projects/node-api && npm i ) \
    && ./node_modules/lerna/cli.js run build --scope="@graphistry/node-api"

# #############################################################################

FROM base
WORKDIR /opt/graphistry-js

COPY \
    projects/js-upload-api/.eslintignore \
    projects/js-upload-api/.eslintrc.cjs \
    /opt/graphistry-js/projects/js-upload-api/

COPY --from=base_js \
    /opt/graphistry-js/projects/client-api \
    /opt/graphistry-js/projects/client-api
RUN  echo "== Final js client" \
    && find /opt/graphistry-js/projects/client-api

COPY --from=base_react \
    /opt/graphistry-js/projects/client-api-react \
    /opt/graphistry-js/projects/client-api-react
RUN  echo "== Final react client" \
    && find /opt/graphistry-js/projects/client-api-react

COPY --from=base_node \
    /opt/graphistry-js/projects/node-api \
    /opt/graphistry-js/projects/node-api
RUN  echo "== Final node client" \
    && find /opt/graphistry-js/projects/node-api
