// React hooks over the Graphistry context. Consumers never see
// useSyncExternalStore, rxjs, or falcor paths — just typed snapshots and
// Promise-returning mutators.

import { useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { SelectionSnapshot, LabelsSnapshot, FiltersSnapshot } from '@graphistry/client-api';
import { Ctx, type GraphistryHandle, type InternalContext } from './internal.js';
import { GraphistryControlledError, GraphistryRpcError } from './errors.js';

function useGraphistryInternal(): InternalContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGraphistry* hooks must be used inside <GraphistryProvider>.');
  return ctx;
}

export function useGraphistry(): GraphistryHandle {
  return useGraphistryInternal().handle;
}

/** Manual registration for callers mounting their own iframe. */
export function useGraphistryScene(): (iframe: HTMLIFrameElement | null) => void {
  return useGraphistryInternal().registerIframe;
}

export function useSelection(): SelectionSnapshot {
  const { stores } = useGraphistryInternal();
  return useSyncExternalStore(stores.selection.subscribe, stores.selection.getSnapshot);
}

export function useLabels(): LabelsSnapshot {
  const { stores } = useGraphistryInternal();
  return useSyncExternalStore(stores.labels.subscribe, stores.labels.getSnapshot);
}

export interface UseFiltersReturn extends FiltersSnapshot {
  add(expr: string): Promise<unknown>;
  remove(id: string): Promise<unknown>;
  reset(): Promise<unknown>;
}

const SCENE_ROOT = ['workbooks', 'open', 'views', 'current'] as const;

/** Build a nested object `{workbooks:{open:{views:{current:{<path…>: value}}}}}`
 *  suitable for an RPC `set` envelope's `jsonGraph`. */
function nestValue(
  path: readonly (string | number)[],
  value: unknown
): Record<string, unknown> {
  const full = [...SCENE_ROOT, ...path];
  let node: unknown = value;
  for (let i = full.length - 1; i >= 0; i--) {
    node = { [String(full[i])]: node };
  }
  return node as Record<string, unknown>;
}

/** Walk a JSONGraph envelope along `path` and return the scalar leaf.
 *  Follows `$ref` chains (the server returns
 *  `workbooks.open → $ref → workbooksById[X]` and
 *  `views.current → $ref → viewsById[X]`, so reaching any view-scoped leaf
 *  requires at least two hops). Unwraps `$atom` wrappers so callers get the
 *  raw value. Returns undefined on missing keys or `$error` sentinels, and
 *  bails defensively after a small hop budget so a cyclic envelope can't
 *  spin forever. */
function readJsonGraphLeaf(
  jsonGraph: unknown,
  path: readonly (string | number)[]
): unknown {
  let node: unknown = jsonGraph;
  let i = 0;
  let refHops = 0;
  // Defensive upper bound; real jsonGraphs rarely chain more than 2-3 refs.
  // Kept high so we don't false-fail on dense $ref graphs.
  const MAX_REF_HOPS = 255;
  const resolve = (n: unknown): unknown => {
    while (n && typeof n === 'object') {
      const sentinel = (n as { $type?: string }).$type;
      if (sentinel === 'atom') return (n as { value?: unknown }).value;
      if (sentinel === 'error') return undefined;
      if (sentinel === 'ref') {
        if (++refHops > MAX_REF_HOPS) return undefined;
        const refPath = (n as { value?: unknown }).value;
        if (!Array.isArray(refPath)) return undefined;
        let target: unknown = jsonGraph;
        for (const seg of refPath) {
          if (target === null || target === undefined || typeof target !== 'object') {
            return undefined;
          }
          target = (target as Record<string, unknown>)[String(seg)];
        }
        n = target;
        continue;
      }
      return n;
    }
    return n;
  };

  while (i < path.length) {
    node = resolve(node);
    if (node === null || node === undefined || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[String(path[i])];
    i++;
  }
  return resolve(node);
}

export interface SceneReadState<T> {
  value: T | undefined;
  loading: boolean;
  error: Error | null;
}

/** Read a single scene-level falcor leaf. Fires `rpc.get` on mount and
 *  whenever the (stable-reference) `path` changes. No subscription — this
 *  is a one-shot read. Callers should either treat the returned value as
 *  "initial state" or re-fetch manually after writes.
 *
 *  Expect callers to pass module-level constant paths or memoized arrays.
 *  We compare path contents via JSON.stringify to avoid infinite refetches
 *  when callers pass array literals. */
export function useSceneValue<T = unknown>(
  path: readonly (string | number)[]
): SceneReadState<T> {
  const { handle } = useGraphistryInternal();
  const rpc = handle.rpc;
  const ready = handle.subscriptionAPIVersion !== null;
  const pathKey = useMemo(() => JSON.stringify(path), [path]);
  const [state, setState] = useState<SceneReadState<T>>({
    value: undefined,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!rpc || !ready) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    rpc
      .get([...SCENE_ROOT, ...path])
      .then((env: unknown) => {
        if (cancelled) return;
        const leaf = readJsonGraphLeaf(
          (env as { jsonGraph?: unknown })?.jsonGraph,
          [...SCENE_ROOT, ...path]
        );
        setState({ value: leaf as T | undefined, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof GraphistryRpcError && (err as { kind?: string }).kind === 'disposed') {
          return;
        }
        setState({ value: undefined, loading: false, error: err as Error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpc, ready, pathKey]);

  return state;
}

/** Batch-read N scene-level falcor leaves in one `rpc.get`. Returns an
 *  array of values aligned to `paths`. Mostly used by panels that need the
 *  metadata of an indexed option set (layout param names/types/bounds). */
export function useSceneValues<T = unknown>(
  paths: readonly (readonly (string | number)[])[]
): { values: (T | undefined)[]; loading: boolean; error: Error | null } {
  const { handle } = useGraphistryInternal();
  const rpc = handle.rpc;
  const ready = handle.subscriptionAPIVersion !== null;
  const pathsKey = useMemo(() => JSON.stringify(paths), [paths]);
  const [state, setState] = useState<{
    values: (T | undefined)[];
    loading: boolean;
    error: Error | null;
  }>({
    values: paths.map(() => undefined),
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!rpc || !ready || paths.length === 0) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    const fullPaths = paths.map((p) => [...SCENE_ROOT, ...p]);
    rpc
      .get(...fullPaths)
      .then((env: unknown) => {
        if (cancelled) return;
        const jg = (env as { jsonGraph?: unknown })?.jsonGraph;
        const values = fullPaths.map((fp) => readJsonGraphLeaf(jg, fp)) as (T | undefined)[];
        setState({ values, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof GraphistryRpcError && (err as { kind?: string }).kind === 'disposed') {
          return;
        }
        setState({ values: paths.map(() => undefined), loading: false, error: err as Error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpc, ready, pathsKey]);

  return state;
}

/** Write-only setter for scene-level falcor leaves. Accepts a relative path
 *  (anchored at `workbooks.open.views.current`) and a value; posts an RPC
 *  `set` envelope to the iframe. No readback — callers own the display value
 *  locally. Intended for prototype controls; a round-trip version can be
 *  added later via SubscriptionManager once read paths are generic. */
export function useSceneSetter(): (
  path: readonly (string | number)[],
  value: unknown
) => Promise<unknown> {
  const { handle } = useGraphistryInternal();
  return useCallback(
    (path, value) => {
      const rpc = handle.rpc;
      if (!rpc || handle.subscriptionAPIVersion === null) {
        return Promise.reject(new Error('Graphistry iframe not yet ready; wait for handle.ready + handshake.'));
      }
      return rpc
        .set({ paths: [[...SCENE_ROOT, ...path]], jsonGraph: nestValue(path, value) })
        .catch((err: unknown) => {
          // StrictMode: the first rpc gets disposed before its response lands;
          // swallow the corresponding error so the panel doesn't flash.
          // `GraphistryRpcError` re-exports from a .js package with no
          // declarations, so `instanceof` narrows to `any` — cast explicitly.
          if (err instanceof GraphistryRpcError && (err as { kind?: string }).kind === 'disposed') {
            return undefined;
          }
          throw err;
        });
    },
    [handle]
  );
}

export function useFilters(): UseFiltersReturn {
  const { stores, handle, controlled } = useGraphistryInternal();
  const snapshot = useSyncExternalStore(stores.filters.subscribe, stores.filters.getSnapshot);

  return {
    ...snapshot,
    add: (expr: string) => {
      if (controlled.has('filters')) {
        return Promise.reject(new GraphistryControlledError('filters', 'filters'));
      }
      return handle.addFilter(expr);
    },
    remove: (id: string) => {
      if (controlled.has('filters')) {
        return Promise.reject(new GraphistryControlledError('filters', 'filters'));
      }
      return handle.removeFilter(id);
    },
    reset: () => {
      if (controlled.has('filters')) {
        return Promise.reject(new GraphistryControlledError('filters', 'filters'));
      }
      return handle.resetFilters();
    },
  };
}

// =========================================================================
// Encoding domain: columns, palettes, encoding apply/reset.
// =========================================================================
//
// These hooks lift encoding-builder logic out of consumer apps so that a
// frontend dev can go from `useColumns()` → `useEncoding('point-color')`
// without ever seeing a falcor path or `$atom` envelope. All Falcor Bridge
// plumbing (ref-walking, polling, server-shape quirks) stays in this
// package.

/** A dataframe column as the viz reports it. `attribute` carries the
 *  `componentType:name` prefix used in falcor paths; `name` is the bare
 *  column name the encoding APIs expect. */
export interface ColumnMeta {
  attribute: string;
  name: string;
  componentType: 'point' | 'edge';
  dataType: string;
  isInternal: boolean;
}

/** A color palette offered by `encodings.options.{point,edge}.color`. */
export interface Palette {
  name: string;
  variant: 'categorical' | 'continuous';
  label?: string;
  colors?: string[];
}

/** Which encoding slot the consumer is targeting. `point-size` never takes
 *  a palette; the two color variants always do. */
export type EncodingKind = 'point-color' | 'point-size' | 'edge-color';

interface EncodingMeta {
  title: string;
  graphType: 'point' | 'edge';
  encodingType: 'color' | 'size';
  needsPalette: boolean;
  numericOnly: boolean;
}

const ENCODING_META: Record<EncodingKind, EncodingMeta> = {
  'point-color': { title: 'Point color', graphType: 'point', encodingType: 'color', needsPalette: true, numericOnly: false },
  'point-size':  { title: 'Point size',  graphType: 'point', encodingType: 'size',  needsPalette: false, numericOnly: true  },
  'edge-color':  { title: 'Edge color',  graphType: 'edge',  encodingType: 'color', needsPalette: true, numericOnly: false },
};

/** Metadata for one encoding kind — useful for panel titles, validation,
 *  and deciding whether to show a palette control. Stable reference. */
export function getEncodingMeta(kind: EncodingKind): Readonly<EncodingMeta> {
  return ENCODING_META[kind];
}

const NUMERIC_COLUMN_TYPES = new Set([
  'number', 'integer', 'float', 'double', 'int', 'long',
]);

/** Filter a column list down to those usable for a given encoding kind:
 *  drops internal columns, mismatched component types, and (for size)
 *  non-numeric columns. Centralizes the "which columns make sense where"
 *  rules so consumer apps don't re-encode them. */
export function columnsForEncoding(
  columns: readonly ColumnMeta[],
  kind: EncodingKind
): ColumnMeta[] {
  const meta = ENCODING_META[kind];
  return columns.filter((c) => {
    if (c.isInternal) return false;
    if (c.componentType !== meta.graphType) return false;
    if (meta.numericOnly && !NUMERIC_COLUMN_TYPES.has(c.dataType)) return false;
    return true;
  });
}

/** Drop the `point:` / `edge:` prefix from a falcor-style attribute so the
 *  server sees the bare column name it actually stores. The server
 *  internally rebuilds `identifier = componentType + ':' + name`; passing
 *  the prefixed form would produce `point:point:degree` and silently
 *  fail to encode. */
function bareAttr(attr: string): string {
  return attr.replace(/^(point|edge):/, '');
}

const PATH_COLUMNS_LENGTH = ['columns', 'length'] as const;
const PATH_POINT_PALETTES = ['encodings', 'options', 'point', 'color'] as const;
const PATH_EDGE_PALETTES  = ['encodings', 'options', 'edge',  'color'] as const;
const COLUMN_FIELDS = ['attribute', 'name', 'componentType', 'dataType', 'isInternal'] as const;

// NOTE — Falcor Bridge limitation (not steady-state design):
// view.columns is populated on the server *asynchronously* during vgraph /
// dataframe load, and the server does not currently push a falcor
// invalidation when that load completes. A single rpc.get at mount
// typically sees length=0. The right long-term fix is subscription-driven
// (like `useFilters`) so the bridge pushes the new length through as soon
// as the vgraph resolves — falcor is built for push-based reactivity.
// Until that's wired up end-to-end we poll `columns.length` with a short
// backoff and per-call timeout.
const COLUMN_POLL_INTERVAL_MS = 400;
const COLUMN_POLL_MAX_ATTEMPTS = 30;
const COLUMN_POLL_PER_CALL_MS = 4000;
const COLUMN_POLL_FIELDS_MS = COLUMN_POLL_PER_CALL_MS * 3;

const pollTimeout = Symbol('pollTimeout');
function raceTimeout<T>(p: Promise<T>, ms: number): Promise<T | typeof pollTimeout> {
  return Promise.race<T | typeof pollTimeout>([
    p,
    new Promise((resolve) => setTimeout(() => resolve(pollTimeout), ms)),
  ]);
}

function isRetryableRpcError(err: unknown): boolean {
  const kind = err instanceof GraphistryRpcError ? (err as { kind?: string }).kind : undefined;
  if (kind === 'disposed' || kind === 'timeout') return true;
  const msg = err instanceof Error ? err.message : '';
  return /timed out|disposed/i.test(msg);
}

/** The list of dataframe columns the viz reports. Consumers filter by
 *  `componentType` / `dataType` / `isInternal` as needed. */
export function useColumns(): { columns: ColumnMeta[]; loading: boolean; error: Error | null } {
  const { handle } = useGraphistryInternal();
  const rpc = handle.rpc;
  const ready = handle.subscriptionAPIVersion !== null;
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!rpc || !ready) return;
    let cancelled = false;
    let attempts = 0;

    const scheduleRetry = () => {
      if (attempts < COLUMN_POLL_MAX_ATTEMPTS) setTimeout(poll, COLUMN_POLL_INTERVAL_MS);
      else setLoading(false);
    };

    const poll = async (): Promise<void> => {
      if (cancelled) return;
      attempts++;
      try {
        const lenEnv = await raceTimeout(
          rpc.get([...SCENE_ROOT, ...PATH_COLUMNS_LENGTH]),
          COLUMN_POLL_PER_CALL_MS
        );
        if (cancelled) return;
        if (lenEnv === pollTimeout) { scheduleRetry(); return; }
        const lenVal = readJsonGraphLeaf(
          (lenEnv as { jsonGraph?: unknown })?.jsonGraph,
          [...SCENE_ROOT, ...PATH_COLUMNS_LENGTH]
        );
        const len = typeof lenVal === 'number' ? lenVal : 0;
        if (len === 0) { scheduleRetry(); return; }

        const fieldPaths: (string | number)[][] = [];
        for (let i = 0; i < len; i++) {
          for (const f of COLUMN_FIELDS) fieldPaths.push([...SCENE_ROOT, 'columns', i, f]);
        }
        const fieldEnv = await raceTimeout(rpc.get(...fieldPaths), COLUMN_POLL_FIELDS_MS);
        if (cancelled) return;
        if (fieldEnv === pollTimeout) { scheduleRetry(); return; }
        const jg = (fieldEnv as { jsonGraph?: unknown })?.jsonGraph;
        const out: ColumnMeta[] = [];
        for (let i = 0; i < len; i++) {
          const base = i * COLUMN_FIELDS.length;
          const name = readJsonGraphLeaf(jg, fieldPaths[base + 1]);
          if (name === undefined || name === null) continue;
          out.push({
            attribute: String(readJsonGraphLeaf(jg, fieldPaths[base]) ?? name),
            name: String(name),
            componentType: readJsonGraphLeaf(jg, fieldPaths[base + 2]) === 'edge' ? 'edge' : 'point',
            dataType: String(readJsonGraphLeaf(jg, fieldPaths[base + 3]) ?? 'unknown'),
            isInternal: !!readJsonGraphLeaf(jg, fieldPaths[base + 4]),
          });
        }
        setColumns(out);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if (isRetryableRpcError(err)) { scheduleRetry(); return; }
        setError(err as Error);
        setLoading(false);
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [rpc, ready]);

  return { columns, loading, error };
}

/** The catalog of color palettes the viz offers for a given component type.
 *  Stable once the iframe handshake completes — loaded in a single rpc.get. */
export function usePalettes(
  componentType: 'point' | 'edge'
): { palettes: Palette[]; loading: boolean; error: Error | null } {
  const path = componentType === 'point' ? PATH_POINT_PALETTES : PATH_EDGE_PALETTES;
  const { value, loading, error } = useSceneValue<Palette[]>(path);
  const palettes = Array.isArray(value) ? value : [];
  return { palettes, loading, error };
}

export interface UseEncodingReturn {
  /** Metadata for this encoding kind (title, whether it needs a palette,
   *  whether the attribute must be numeric). Stable reference. */
  meta: Readonly<EncodingMeta>;
  /** Apply an encoding. `attribute` is from `ColumnMeta.attribute`
   *  (prefixed form) — strips internally. `palette` is required for color
   *  encodings, ignored for size. */
  apply(args: { attribute: string; palette?: Palette }): Promise<unknown>;
  /** Clear the encoding back to viz defaults. */
  reset(): Promise<unknown>;
  /** True while an apply/reset is in flight. */
  writing: boolean;
  /** Most recent error from apply/reset. Cleared on next apply/reset. */
  lastError: Error | null;
}

/** Imperative apply/reset handle for one encoding slot.
 *
 *  The hook hides: the `workbooks.open.views.current.encodings.X.Y` falcor
 *  path shape, the atom-wrapping done by the iframe-side setFromEnvelope,
 *  the `attribute` bare-name requirement, and the palette `{name,
 *  variation, colors}` spread the server's scaling expects. Consumers only
 *  pass the ColumnMeta-derived attribute and a Palette from usePalettes. */
export function useEncoding(kind: EncodingKind): UseEncodingReturn {
  const { handle } = useGraphistryInternal();
  const [writing, setWriting] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const meta = ENCODING_META[kind];

  const run = useCallback(async (spec: Record<string, unknown>): Promise<unknown> => {
    const rpc = handle.rpc;
    if (!rpc || handle.subscriptionAPIVersion === null) {
      throw new Error('Graphistry iframe not yet ready; wait for handle.ready + handshake.');
    }
    setWriting(true);
    setLastError(null);
    const leafPath: (string | number)[] = [...SCENE_ROOT, 'encodings', meta.graphType, meta.encodingType];
    try {
      return await rpc.set({
        paths: [leafPath],
        // The Falcor Bridge's iframe-side setFromEnvelope wraps the leaf in
        // $atom before dispatching falcor model.set — don't pre-wrap here
        // or the server reads an atom-of-atom and silently no-ops (which
        // manifests as a 30s RPC timeout on the client).
        jsonGraph: {
          workbooks: { open: { views: { current: { encodings: {
            [meta.graphType]: { [meta.encodingType]: spec },
          } } } } },
        },
      });
    } catch (err) {
      // StrictMode / iframe-reload teardown — swallow so UI doesn't flash.
      if (err instanceof GraphistryRpcError && (err as { kind?: string }).kind === 'disposed') return undefined;
      setLastError(err as Error);
      throw err;
    } finally {
      setWriting(false);
    }
  }, [handle, meta]);

  const apply = useCallback(({ attribute, palette }: { attribute: string; palette?: Palette }) => {
    const spec: Record<string, unknown> = {
      encodingType: meta.encodingType,
      graphType: meta.graphType,
      attribute: bareAttr(attribute),
    };
    if (meta.needsPalette && palette) {
      spec.name = palette.name;
      spec.variation = palette.variant;
      // `inferColorScalingSpecFor` takes colors directly off the spec; without
      // it the scaling's range is empty and every bin maps to null (black).
      if (palette.colors && palette.colors.length > 0) spec.colors = palette.colors;
    }
    return run(spec);
  }, [meta, run]);

  const reset = useCallback(() => run({
    encodingType: meta.encodingType,
    graphType: meta.graphType,
    reset: true,
  }), [meta, run]);

  return { meta, apply, reset, writing, lastError };
}
