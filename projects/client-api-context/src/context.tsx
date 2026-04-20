// Graphistry React provider + scene component.
//
// Components only — hooks live in hooks.ts, shared types + Context live in
// internal.ts. This split keeps Fast Refresh working when editing either.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createRpcClient,
  ExternalStore,
  SubscriptionManager,
  PATH_SELECTION_LABELS,
  PATH_LABELS,
  PATH_FILTERS,
  initialSelection,
  initialLabels,
  initialFilters,
  projectSelection,
  projectLabels,
  projectFilters,
  FRAGMENT_FILTERS,
  type RpcClient,
  type SelectionSnapshot,
  type LabelsSnapshot,
  type FiltersSnapshot,
} from '@graphistry/client-api';
import { Ctx, type ControlledDomain, type GraphistryHandle, type InternalContext } from './internal.js';
import { GraphistryControlledError, GraphistryRpcError } from './errors.js';

const SUBSCRIPTION_API_VERSION = 2;

const PATH_VIEW = ['workbooks', 'open', 'views', 'current'] as const;
const PATH_FILTERS_ADD = [...PATH_VIEW, 'filters', 'add'] as const;
const PATH_FILTERS_REMOVE = [...PATH_VIEW, 'filters', 'remove'] as const;
const PATH_FILTERS_RESET = [...PATH_VIEW, 'filters', 'reset'] as const;
const PATH_SELECTION_SET_EXTERNAL = [...PATH_VIEW, 'selection', 'setExternal'] as const;

export interface GraphistryProviderProps {
  children?: ReactNode;
  /** Graphistry server host, e.g. "hub.graphistry.com". */
  host: string;
  /** Dataset id / slug. */
  dataset: string;
  /** Escape hatch — full iframe src URL. Overrides host+dataset. */
  src?: string;
  /** Extra query-string params appended to the iframe URL. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Scene background color (hex, e.g. `#0B0C14`). Applied over RPC after the
   *  iframe handshake completes (targets falcor path `scene.bg.color`). */
  bg?: string;
  /** RPC timeout in ms. Default 30000. */
  rpcTimeoutMs?: number;
  /** When set, the filters domain is controlled — hook mutators throw. */
  filters?: readonly string[];
  /** When set, the exclusions domain is controlled. */
  exclusions?: readonly string[];
}

function buildSceneSrc(props: GraphistryProviderProps): string {
  if (props.src) return props.src;
  const base = `https://${props.host.replace(/\/$/, '')}/graph/graph.html`;
  const qs = new URLSearchParams();
  qs.set('dataset', props.dataset);
  for (const [k, v] of Object.entries(props.params ?? {})) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  return `${base}?${qs.toString()}`;
}

function deriveControlled(props: GraphistryProviderProps): Set<ControlledDomain> {
  const out = new Set<ControlledDomain>();
  if (props.filters !== undefined) out.add('filters');
  if (props.exclusions !== undefined) out.add('exclusions');
  return out;
}

export function GraphistryProvider(props: GraphistryProviderProps) {
  const { children, rpcTimeoutMs } = props;

  const subs = useRef<SubscriptionManager | null>(null);
  const storesRef = useRef<InternalContext['stores'] | null>(null);

  if (subs.current === null) {
    const manager = new SubscriptionManager();
    const selection = new ExternalStore<SelectionSnapshot>({
      initial: initialSelection,
      arrayKeys: ['points', 'edges', 'pointLabels', 'edgeLabels'],
      onFirstListener: () => manager.acquire(PATH_SELECTION_LABELS),
      onLastListener: () => manager.release(PATH_SELECTION_LABELS),
    });
    const labels = new ExternalStore<LabelsSnapshot>({
      initial: initialLabels,
      arrayKeys: ['labels'],
      onFirstListener: () => manager.acquire(PATH_LABELS),
      onLastListener: () => manager.release(PATH_LABELS),
    });
    const filters = new ExternalStore<FiltersSnapshot>({
      initial: initialFilters,
      arrayKeys: ['filters'],
      onFirstListener: () => manager.acquire(PATH_FILTERS),
      onLastListener: () => manager.release(PATH_FILTERS),
    });
    // v1 hand-enriched paths: no pathSets — iframe uses its custom fragment + publishedPathUpdatedSubject.
    // `withColumns: true` asks the iframe-side selection container to expand
    // the label fragment to include the row's full column values, so panels
    // can render per-node fields (see LocalDataSink.getSelectionLabelFragment).
    manager.register(PATH_SELECTION_LABELS, selection, projectSelection, undefined, { withColumns: true });
    manager.register(PATH_LABELS, labels, projectLabels);
    // v2 generic path: pathSets sent to iframe, which opens model.get(...) internally.
    manager.register(PATH_FILTERS, filters, projectFilters, FRAGMENT_FILTERS);
    subs.current = manager;
    storesRef.current = { selection, labels, filters };
  }
  const stores = storesRef.current!;

  const [rpc, setRpc] = useState<RpcClient | null>(null);
  const [subscriptionAPIVersion, setSubscriptionAPIVersion] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const controlled = useMemo(
    () => deriveControlled(props),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.filters, props.exclusions]
  );

  const registerIframe = useCallback((iframe: HTMLIFrameElement | null) => {
    if (iframeRef.current && iframeRef.current !== iframe) {
      const prev = iframeRef.current as HTMLIFrameElement & { __graphistryCleanup?: () => void };
      prev.__graphistryCleanup?.();
      subs.current?.detachIframe();
      setRpc((r) => {
        r?.dispose();
        return null;
      });
      setSubscriptionAPIVersion(null);
    }
    iframeRef.current = iframe;
    if (!iframe) return;

    subs.current!.attachIframe(iframe);
    setRpc(createRpcClient(iframe, { timeoutMs: rpcTimeoutMs }));

    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow) return;
      const data = e.data as { type?: string; agent?: string; subscriptionAPIVersion?: number } | undefined;
      if (!data || data.agent !== 'graphistryjs' || data.type !== 'init') return;
      console.debug('[ctx] ←iframe init; subscriptionAPIVersion=', data.subscriptionAPIVersion);
      if (typeof data.subscriptionAPIVersion === 'number') {
        setSubscriptionAPIVersion(data.subscriptionAPIVersion);
      }
      console.debug('[ctx] →iframe graphistry-init-ack');
      iframe.contentWindow?.postMessage(
        { type: 'graphistry-init-ack', agent: 'graphistryjs', subscriptionAPIVersion: SUBSCRIPTION_API_VERSION },
        '*'
      );
    };
    window.addEventListener('message', onMessage);
    const sendReady = (why: string) => {
      console.debug('[ctx] →iframe ready (' + why + ')');
      iframe.contentWindow?.postMessage(
        { type: 'ready', agent: 'graphistryjs', subscriptionAPIVersion: SUBSCRIPTION_API_VERSION },
        '*'
      );
    };
    sendReady('register');
    const onLoad = () => sendReady('iframe-load');
    iframe.addEventListener('load', onLoad);
    (iframe as HTMLIFrameElement & { __graphistryCleanup?: () => void }).__graphistryCleanup = () => {
      window.removeEventListener('message', onMessage);
      iframe.removeEventListener('load', onLoad);
    };
  }, [rpcTimeoutMs]);

  // After RPC mutations, the iframe's generic-subscribe push pipeline does
  // not always observe the resulting falcor model change (RPC routes through
  // the whitelisted dataSource model; `falcor-update` events fire on the raw
  // model). Force a re-fetch on the relevant subscription so panels reflect
  // the new state.
  const refreshAfter = useCallback(<T,>(p: Promise<T>, path: string): Promise<T> => {
    return p.then((v) => { subs.current?.refresh(path); return v; });
  }, []);

  const handle = useMemo<GraphistryHandle>(() => ({
    rpc,
    ready: rpc !== null,
    subscriptionAPIVersion,
    addFilter: (expr) => {
      if (controlled.has('filters')) throw new GraphistryControlledError('filters', 'filters');
      if (!rpc) return Promise.reject(new Error('Graphistry iframe not yet mounted; wait for handle.ready.'));
      return refreshAfter(rpc.call(PATH_FILTERS_ADD, [expr]), PATH_FILTERS);
    },
    removeFilter: (id) => {
      if (controlled.has('filters')) throw new GraphistryControlledError('filters', 'filters');
      if (!rpc) return Promise.reject(new Error('Graphistry iframe not yet mounted; wait for handle.ready.'));
      return refreshAfter(rpc.call(PATH_FILTERS_REMOVE, [id]), PATH_FILTERS);
    },
    resetFilters: () => {
      if (controlled.has('filters')) throw new GraphistryControlledError('filters', 'filters');
      if (!rpc) return Promise.reject(new Error('Graphistry iframe not yet mounted; wait for handle.ready.'));
      return refreshAfter(rpc.call(PATH_FILTERS_RESET, []), PATH_FILTERS);
    },
    setSelectionExternal: (points, edges, darken) => {
      if (controlled.has('selection')) throw new GraphistryControlledError('selection', 'selection');
      if (!rpc) return Promise.reject(new Error('Graphistry iframe not yet mounted; wait for handle.ready.'));
      return refreshAfter(rpc.call(PATH_SELECTION_SET_EXTERNAL, [Array.from(points), Array.from(edges), !!darken]), PATH_SELECTION_LABELS);
    },
  }), [rpc, subscriptionAPIVersion, controlled, refreshAfter]);

  const sceneSrc = useMemo(
    () => buildSceneSrc(props),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.host, props.dataset, props.src, props.params]
  );

  // Scene-level RPC props get pushed into the falcor model once the iframe
  // handshake completes. The live-reactive path is `scene.renderer.background.color`
  // (see apps/core/viz/src/models/scene/scene.js — `scene.bg.color` is a $ref
  // to `scene.renderer.background`, not the color leaf, so writing there
  // does not propagate to the rendering component).
  //
  // Gated on subscriptionAPIVersion rather than just `rpc` because `rpc` is
  // non-null the moment registerIframe runs (before iframe.contentWindow has
  // loaded its LocalDataSink listener). Firing too early drops the message
  // into a pre-handshake void — same failure mode as early subscribes.
  const { bg } = props;
  useEffect(() => {
    if (!rpc || subscriptionAPIVersion === null || bg === undefined) return;
    console.debug('[GraphistryProvider] →iframe set scene.renderer.background.color =', bg);
    rpc.set({
      paths: [[...PATH_VIEW, 'scene', 'renderer', 'background', 'color']],
      jsonGraph: { workbooks: { open: { views: { current: { scene: { renderer: { background: { color: bg } } } } } } } },
    }).catch((err) => {
      // StrictMode disposes the first rpc before its response lands; second
      // mount carries a fresh rpc and resolves normally.
      if (err instanceof GraphistryRpcError && err.kind === 'disposed') return;
      console.warn('[GraphistryProvider] bg set failed:', err);
    });
  }, [rpc, subscriptionAPIVersion, bg]);

  const value = useMemo<InternalContext>(() => ({
    stores,
    handle,
    controlled,
    registerIframe,
    sceneSrc,
  }), [stores, handle, controlled, registerIframe, sceneSrc]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export interface GraphistrySceneProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src?: string;
}

export function GraphistryScene({ src, style, ...rest }: GraphistrySceneProps) {
  // Only pull the stable bits out of context. `registerIframe` is a stable
  // useCallback inside the Provider; `sceneSrc` only changes when the
  // Provider's host/dataset props change. Depending on the whole `ctx`
  // object would regenerate this component's ref callback on every
  // Provider re-render, which in React 19 triggers re-attach cycles and
  // an infinite setState loop through registerIframe → setRpc.
  const ctx = useContextOrThrow();
  const { registerIframe, sceneSrc: defaultSrc } = ctx;
  const ref = useRef<HTMLIFrameElement | null>(null);

  const setRef = useCallback((el: HTMLIFrameElement | null) => {
    if (ref.current && ref.current !== el) {
      (ref.current as HTMLIFrameElement & { __graphistryCleanup?: () => void }).__graphistryCleanup?.();
      registerIframe(null);
    }
    ref.current = el;
    if (el) registerIframe(el);
  }, [registerIframe]);

  return (
    <iframe
      ref={setRef}
      src={src ?? defaultSrc}
      style={{ width: '100%', height: '100%', border: 'none', ...style }}
      allowFullScreen
      allow="fullscreen"
      {...rest}
    />
  );
}

// Local import of useContext to avoid exporting a hook from this components-only file.
// (A hook defined inside the file is fine for Fast Refresh; only hook *exports* break it.)
import { useContext } from 'react';
function useContextOrThrow(): InternalContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('GraphistryScene must be used inside <GraphistryProvider>.');
  return ctx;
}
