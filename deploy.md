# graphistry-js embedded dev — implementor handoff

You edit the viz (`graphistry/apps/core/viz/src/`) and the JS client stack (`graphistry-js/projects/client-api/src/`, `projects/client-api-context/src/`).

## Who does what

- **Alex** reviews in a Mac browser over Tailscale. He doesn't run anything.
- **You** run the example Vite dev server and read its logs. You own that loop.
- **Operator** owns the Graphistry docker-compose dev stack + Tailscale routes.

## Hot-reload — no build step in the hot path

- `apps/core/viz/src/` → nodemon + webpack-dev-server HMR push updates into Alex's iframe.
- `graphistry-js/projects/*/src/` → Vite HMR via `resolve.alias` in `projects/client-api-context-example/vite.config.ts`.

## Run the example yourself

Exact command (keeps stderr in the same stream so you can grep the task-output for it):

```bash
cd /data/projects/graphistry/graphistry-js/projects/client-api-context-example && npm run dev 2>&1
```

Binds `0.0.0.0:5174`; Tailscale exposes `:8493`.

Browser `console.*` and uncaught errors stream to your Vite terminal via `server.forwardConsole`. That's your debugging channel.

## Agent debug loop

Vite's stdout lands at `/proc/<vite-pid>/fd/1` → a Claude task-output file; tail it to read every `→iframe get` / `←iframe ok` envelope. Loop: edit → `ScheduleWakeup` ~60–90s for HMR to land and hooks to re-fire → grep the log for the latest matching RPC id → judge response shape → iterate. Ask Alex for restart sequence 1 if the viz looks stuck.

## Iframe HMR route (gotcha)

```
browser  wss://…:8495/sockjs-node → tailscale → 127.0.0.1:3002 → container:3000 (WDS)
```

`WDS_SOCKET_PORT=8495` only tells the browser where to reconnect; WDS is hard-coded at 3000 in `apps/core/viz/scripts/start.js` — don't try to change the listen port.

## Builds (not hot path)

Only needed before hand-off, on `package.json` changes, or if hot-reload gets confused.

| Package | `npm run build` produces |
|---|---|
| `client-api` | `dist/index.{cjs,esm,iife}.min.js` |
| `client-api-context` | `dist/index.{js,cjs}` + `.d.ts` |
| `client-api-context-example` | `dist/` (also the fastest TS typecheck) |

Deps drift → `npm install --no-workspaces` in the affected package (no workspaces field at root).

## Restart sequences (operator, flag if needed)

**1. Viz-side code restart (most common)** — source changes that nodemon/WDS missed, or you want a clean slate:

```bash
docker restart compose-streamgl-viz-1 compose-nginx-1
```

Always pair `nginx` with `streamgl-viz` (and `streamgl-gpu`, `forge-etl-python`): on recreate, containers get new IPs; nginx's `upstream { keepalive }` caches the old IP until restart, causing 502s that surface as HTML error pages / RxJS "undefined stream" errors.

**2. Compose config change** (ports, env, mounts) — `docker restart` isn't enough; need recreate:

```bash
docker rm -f compose-streamgl-viz-1
cd /data/projects/graphistry/graphistry && CUDA_SHORT_VERSION=13 ./dc.dev up -d --force-recreate streamgl-viz
docker restart compose-nginx-1
```

**3. New npm dep in viz** — image rebuild:

```bash
cd /data/projects/graphistry/graphistry
CUDA_SHORT_VERSION=13 ./dc.dev build streamgl-viz
CUDA_SHORT_VERSION=13 ./dc.dev up -d --force-recreate streamgl-viz
docker restart compose-nginx-1
```

## Summary

| Change | File(s) | Action |
|---|---|---|
| Client API / context / example | `graphistry-js/projects/*/src/**` | nothing — Vite HMR |
| Viz source | `apps/core/viz/src/**` | nothing — nodemon + WDS |
| Viz stuck / stale bundle | — | sequence 1 |
| Compose ports/env changed | `compose/development.yml` | sequence 2 |
| Viz dep added | `apps/core/viz/package.json` | sequence 3 |
