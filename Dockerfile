FROM node:16.13.0-slim as base
WORKDIR /opt/graphistry-js
COPY lerna.json package.json ./
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm \
    && echo "=== Installing build tools ===" \
    && npm install
COPY projects/client-api/package.json /opt/graphistry-js/projects/client-api/package.json
COPY projects/client-api-react/package.json /opt/graphistry-js/projects/client-api-react/package.json
RUN --mount=type=cache,target=/usr/src/app/.npm\
    echo "=== Installing and linking project dependencies ===" \
    && npm run bootstrap

FROM base as base_js
WORKDIR /opt/graphistry-js
COPY projects/client-api /opt/graphistry-js/projects/client-api
RUN echo "=== Building client-api ===" \
    && ls -alh ./node_modules/lerna \
    && find /usr/src/app/.npm \
    && ./node_modules/lerna/cli.js run build --scope="@graphistry/client-api"

FROM base_js as base_react
WORKDIR /opt/graphistry-js
COPY projects/client-api-react /opt/graphistry-js/projects/client-api-react
RUN echo "=== Building client-api-react ===" \
    && ./node_modules/lerna/cli.js run build --scope="@graphistry/client-api-react"


FROM base
WORKDIR /opt/graphistry-js
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

ENTRYPOINT [ "/bin/bash" ]