# AGENTS.md — briefing for agents working on `feat/external-bridge`

Minimal operational notes for picking up the `@graphistry/client-api-context` prototype. The "why" and architecture are in `graphistry/ai_code_notes/architecture/external_bridge.md` and `client_context.md` — read those first if you're doing design work. This file is for getting productive quickly.

## What this prototype is

A React provider + hooks surface over the Graphistry iframe's falcor model. Lets host apps mount `<GraphistryScene />`, hide the built-in chrome, and build custom inspector / filter bar / etc. with `useSelection()`, `useFilters()`, `useGraphistry()` — no rxjs, no falcor knowledge required.

Spans two repos, both on branch `feat/external-bridge`:
- `graphistry/` — iframe side (`apps/core/viz/src/client/falcor/LocalDataSink.js` — Protocol v2)
- `graphistry-js/` — host side (this repo)

Packages involved in this repo (`projects/`):
- `client-api/` — existing package; we added `rpc.js`, `externalStore.js`, `subscriptions.js`, `snapshots.js`, `errors.js`. Framework-agnostic.
- `client-api-context/` — **new**. React-only. Provider, Scene, hooks.
- `client-api-context-example/` — **new**. Vite + React 19 + Tailwind 4 smoke test.

## Getting started

**Prereq:** Alex's dev Graphistry on `:8491` must be up and running `feat/external-bridge` branch (has Protocol v2). If it's down, the iframe won't load and you'll see no data. Alex owns that stack — ask, don't try to bring it up yourself.

```bash
cd projects/client-api-context-example
npm install --no-workspaces --legacy-peer-deps   # only if deps weren't restored
npm run dev                                       # Vite on 127.0.0.1:5174
```

Vite is reached on Alex's Mac via the Tailscale proxy at `https://exrhizome.tailc68bf0.ts.net:8493/`. Port mapping and proxy are his setup — don't worry about it.

### How packages link

**No npm workspace linking, no build step.** `vite.config.ts` uses `resolve.alias`:

```ts
'@graphistry/client-api-context': resolve(__dirname, '../client-api-context/src/index.ts'),
'@graphistry/client-api':         resolve(__dirname, '../client-api/src/index.js'),
```

Editing any file under either package's `src/` hot-reloads live in the running example. The example's `package.json` lists them as `file:…` deps just to make `npm install` happy; the alias is what actually resolves at runtime.

## Gotchas — things that burned time

1. **React 19 ref callback identity.** If a ref callback's `useCallback` depends on the whole context object, every Provider value update regenerates the callback, React treats it as needing re-attach, old(null)→new(el) cycles, and `setRpc(null)` inside the null branch re-triggers the loop → `Maximum update depth exceeded`. Always destructure *stable* pieces (`registerIframe`, `sceneSrc`) out of ctx and depend on just those. See `context.tsx` `GraphistryScene` for the working pattern.

2. **Fast Refresh bails on mixed exports.** A file exporting both a component (`GraphistryProvider`) and a hook or non-component (`useGraphistry`) forces full reload on every edit. That's why this package is split across `context.tsx` (components only), `hooks.ts` (hooks only), `internal.ts` (Ctx + types), `errors.ts` (error classes).

3. **`vite-plugin-console-forward` peer dep ≤ Vite 6** — plugin predates Vite 7/8. Install with `--legacy-peer-deps`; runtime is fine because it only uses the stable HMR `send`/`on` API. It forwards browser `console.*` and unhandled errors to the Vite dev-server stdout prefixed `[browser:…]`, which is how an agent editing on the server sees runtime behavior without devtools on the Mac.

4. **HMR WS over Tailscale** needs `hmr: { clientPort: 8493, protocol: 'wss' }` in `vite.config.ts`. If the WS can't upgrade (proxy dropping `Connection: Upgrade` headers), console-forward also stops working — they ride the same socket. Symptom: `send was called before connect` spam from `@vite/client`. Check devtools Network → WS for a `101 Switching Protocols` on the vite endpoint.

5. **Chrome-disable URL params** (passed through `GraphistryProvider params={...}`):
   - `menu=false` — hides toolbar (`view.js:104` collapses toolbarHeight to 0)
   - `info=false` — hides session info bar
   - `splashAfter=false` — kills splash (`server/splash.js:13`)
   - `type=arrow` — required by this dataset format
   - Note: `play={number}` is *layout duration*, NOT a splash toggle. Easy to confuse.

6. **`hub.graphistry.com` runs old viz code.** It does not support Protocol v2 (no RPC envelope, no generic `pathSets` subscribe, no `graphistry-sub-error`). For end-to-end testing you MUST point at Alex's dev Graphistry. Default HOST in the example is `${location.hostname}:8491` exactly for this reason.

7. **Protocol v2 generic subscribe uses `this.model`**, not the whitelisted router. The raw falcor Model is passed to `LocalDataSink` via live.js so we can hook its `_source.emitter.on('falcor-update', …)` for push. Consequence: a malicious client could subscribe to any pathSet in the full schema, not just `withClientAPIRoutes`. Acceptable for trusted-embed, TODO for untrusted — wrap with a whitelist check.

## Protocol v2 quick reference

Wire messages (all have `agent: 'graphistryjs'`):

| Message | Who sends | Shape |
|---|---|---|
| `ready` | host → iframe | `{subscriptionAPIVersion: 2}` |
| `init` | iframe → host | `{cache, subscriptionAPIVersion}` |
| `graphistry-init-ack` | host → iframe | `{subscriptionAPIVersion: 2}` |
| `graphistry-subscribe` | host → iframe | `{path, pathSets?, options?}` |
| `graphistry-unsubscribe` | host → iframe | `{path}` |
| `graphistry-sub-update` | iframe → host | `{path, data}` — iframe walks static prefix of first pathSet before posting |
| `graphistry-sub-error` | iframe → host | `{path, error: {kind, path, flag?, message}}` |
| `graphistry-rpc-request` | host → iframe | `{id, op: 'call'\|'get'\|'set', path?/paths?/json?, args?}` |
| `graphistry-rpc-response` | iframe → host | `{id, result?, error?: {kind, op, message}}` |

### RPC is generic — no op whitelist

`op` is only `call`/`get`/`set`; the iframe proxies to `getDataSource()` (the `withClientAPIRoutes`-filtered router). The whitelist is `ClientAPIRoutes.js`. Client-side convenience (`g.addFilter(expr)`) lives in `client-api-context`; the iframe stays dumb.

### Subscribe is two-mode

- **v1 hand-enriched** (`.labels`, `.selection.labels`): no `pathSets`, iframe uses a custom fragment + viz-side React container that calls `publishedPathUpdatedSubject.next({path, data})`. Kept for back-compat.
- **v2 generic** (everything else): client sends `pathSets`, iframe opens `model.get(...).subscribe(...)` and relays on any server `falcor-update`. No viz-side container needed. Fragments canonicalized in `client-api/src/snapshots.js` (e.g. `FRAGMENT_FILTERS`).

## Key files

### graphistry-js

- `projects/client-api/src/rpc.js` — `createRpcClient` + `GraphistryRpcError`
- `projects/client-api/src/externalStore.js` — shallow-eq + refcount store
- `projects/client-api/src/subscriptions.js` — `SubscriptionManager`, postMessage dispatch
- `projects/client-api/src/snapshots.js` — projections + `FRAGMENT_FILTERS`
- `projects/client-api-context/src/context.tsx` — `GraphistryProvider`, `GraphistryScene`
- `projects/client-api-context/src/hooks.ts` — all hooks
- `projects/client-api-context/src/internal.ts` — `Ctx` + shared types
- `projects/client-api-context/src/client-api.d.ts` — ambient types for the untyped JS package
- `projects/client-api-context-example/src/App.tsx` — the demo
- `projects/client-api-context-example/vite.config.ts` — Tailwind + console-forward + HMR config

### graphistry

- `apps/core/viz/src/client/falcor/LocalDataSink.js` — Protocol v2 handlers
- `apps/core/viz/src/client/live.js` — where LocalDataSink gets constructed with the raw model
- `apps/core/viz/src/client/falcor/ClientAPIRoutes.js` — the RPC whitelist (Falcor QL)
- `ai_code_notes/architecture/external_bridge.md` — design overview
- `ai_code_notes/architecture/client_context.md` — MVP plan + Protocol v2 wire shapes
- `ai_code_notes/architecture/fragments.md` — falcor path inventory (pre-existing, curated)

## Current state

- Branches `feat/external-bridge` on both repos, not pushed.
- Example renders with Tailwind dashboard theme, floating panels over a full-bleed viz.
- Dev graphistry was being updated as of session handoff — end-to-end connection not yet verified.
- RPC envelope + generic subscribe implemented and type-check. Runtime untested against the matching graphistry build.

## Next goals

1. **Debug connection between example and dev Graphistry.** Watch `[browser:…]` output from vite-plugin-console-forward. Expected behaviors when handshake succeeds: init postMessage arrives, `useGraphistry().ready` goes true, `useGraphistry().subscriptionAPIVersion` shows `2`. When `useSelection()` is read, a `graphistry-subscribe` for `.selection.labels` fires; expect either a sub-update (data) or a sub-error (likely permission, if `flag_unsafe_jsapi_export_row` is off on Alex's dev box). For `useFilters()`, expect a sub-update carrying the filters pseudo-array once any filter exists on the view.

2. **Style polish.** Current theme is dashboard-dark + brand teal/purple/green. Good targets: cleaner typography for the label lists, empty/loading states, subtle entry animations on panels, better error affordances (a dismissable toast would be nicer than the inline red block).

## Branch etiquette

- Commits should stay focused (one concern each). Architecture decisions go in the architecture docs, not in commit messages.
- Don't rebase or force-push `feat/external-bridge`; Alex pulls from it.
- No pushes to remote unless asked.

## Watching runtime behavior

```bash
# From the exrhizome server, after `npm run dev` backgrounded:
tail -f <the vite stdout>
```

`[browser:debug]` / `[browser:log]` / `[browser:warn]` / `[browser:error]` prefixed lines are browser-side. `[vite]` lines are HMR. If neither stream updates when you edit a file, HMR WS is broken — see gotcha #4.

## Environment

This is Alex's `exrhizome` server, not your machine. Run and edit freely. For infrastructure questions (how graphistry is deployed, tailscale routing, mode switching) ask Alex — `deploy.md` in this repo has the gory details but you almost certainly don't need them.
