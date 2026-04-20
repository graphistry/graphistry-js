# Iframe webpack-dev-server HMR over Tailscale — deploy ask

## Problem

Alex develops from a Mac over Tailscale. The example app (`projects/client-api-context-example`) is served by Vite, reverse-proxied through Tailscale at `https://exrhizome.tailc68bf0.ts.net:8493/`. That works.

The example iframes Graphistry viz from `https://exrhizome.tailc68bf0.ts.net:8491/graph/graph.html?...`. The viz page loads fine, but its webpack-dev-server HMR client in the browser fails:

```
WebSocket connection to 'wss://exrhizome.tailc68bf0.ts.net:3000/sockjs-node' failed
```

Port **3000** is not exposed through Tailscale. Consequence: iframe code edits (`apps/core/viz/src/**`) do not hot-reload in Alex's browser — he has to hard-refresh every time. This makes the feedback loop much slower than editing Vite-served code, and it blocks an agent-driven dev workflow where the agent on the exrhizome server edits viz source and expects the iframe to auto-update.

The parent Vite HMR at `:8493` **does** work (see `projects/client-api-context-example/vite.config.ts` — `hmr: { clientPort: 8493, protocol: 'wss' }`). We need the analogous setup for the iframe's webpack-dev-server.

## What to change

The viz dev-server already reads env vars for its HMR socket — defined in
`apps/core/viz/scripts/config/webpackDevServer.config.js`:

```js
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default '/sockjs-node'
const sockPort = process.env.WDS_SOCKET_PORT;
// ...
sockHost,
sockPath,
sockPort,
port: sockPort,
```

So `WDS_SOCKET_PORT` controls **both** the port webpack-dev-server listens on **and** the port the browser client tries to connect back to.

Pick a new Tailscale-exposed port — proposing **`:8495`** (next one after our existing `:8491` viz / `:8493` vite proxy). Then:

### 1. Set env vars on the `streamgl-viz` service

In `graphistry/`'s dev compose file for the `streamgl-viz` service, add:

```
WDS_SOCKET_HOST=exrhizome.tailc68bf0.ts.net
WDS_SOCKET_PORT=8495
WDS_SOCKET_PATH=/sockjs-node      # (default, but setting explicitly avoids surprises)
```

This makes the dev-server listen on `:8495` inside the container and tells the browser client to reconnect to `wss://exrhizome.tailc68bf0.ts.net:8495/sockjs-node`.

### 2. Expose `:8495` through the Tailscale reverse proxy

Whatever layer terminates `:8491` and `:8493` for Tailscale (nginx / caddy / tailscale serve / k3s ingress — whichever Alex uses) needs an equivalent entry for `:8495`:

- TLS-terminated at the proxy (same cert as the other ports)
- WebSocket `Upgrade` / `Connection` headers passed through (sockjs upgrades to a WS)
- Forwarded to `streamgl-viz` container port `:8495` (plain HTTP/WS on the internal side)

If it's easier, `path`-based multiplexing on the existing `:8491` would also work — but we'd have to set `WDS_SOCKET_PORT=8491` + `WDS_SOCKET_PATH=/viz-hmr/sockjs-node` and add a path-prefix route on the proxy. Port-based is simpler; up to you.

### 3. Restart streamgl-viz

```
cd /data/projects/graphistry/graphistry && ./dc.dev restart streamgl-viz
```

## Acceptance test

1. Alex refreshes the example app in his Mac browser (Tailscale URL).
2. Chrome devtools → Network → filter "WS" → see a request to `wss://exrhizome.tailc68bf0.ts.net:8495/sockjs-node` with status **`101 Switching Protocols`**. No red `failed` entries for the sockjs URL.
3. Agent edits `apps/core/viz/src/client/falcor/LocalDataSink.js` on the exrhizome server (e.g. add a `console.log('hmr test')` inside the constructor). Within a couple of seconds the iframe reloads and the new log appears in the iframe's console — no hard refresh required.

## Nice-to-have while you're in the area

Separate issue but closely related — `logger.js:84 POST https://exrhizome.tailc68bf0.ts.net:8491/error 404 (Not Found)` spams the console whenever the viz runtime logs an error. That's the iframe's internal error logger trying to POST to a `/error` endpoint that doesn't exist on this dev build. Either wire up a no-op `/error` handler in the viz dev stack, or disable the POST branch in `apps/core/viz/src/logger/logger.js` (toBoth at line ~118). Low priority; can be a separate PR.

## Context / why this matters

- Closes the "I edit iframe source on the server → Alex sees changes in his browser" loop that already works for Vite-served code.
- Makes the `feat/external-bridge` prototype actually iterable from Alex's Mac without needing to restart `streamgl-viz` manually on every iframe-side change.
- The existing Vite tunnel pattern (`hmr: { clientPort, protocol: 'wss' }`) proves the approach works; this is the same pattern applied to the iframe's dev-server.
