// Graphistry React provider + scene component.
//
// Owns the subscription manager, the RPC client, the handshake, and the
// controlled-domain set. Everything stateless/reusable lives in
// @graphistry/client-api; this file is purely the React lifecycle glue.

import {
  createContext,
  useCallback,
  useContext,
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
import { GraphistryControlledError } from './errors.js';

const SUBSCRIPTION_API_VERSION = 2;

// Falcor paths for imperative ops. The iframe just proxies to the
// withClientAPIRoutes-whitelisted model — these are the canonical paths.
const PATH_VIEW = ['workbooks', 'open', 'views', 'current'] as const;
const PATH_FILTERS_ADD = [...PATH_VIEW, 'filters', 'add'] as const;
const PATH_FILTERS_RESET = [...PATH_VIEW, 'filters', 'reset'] as const;
const PATH_SELECTION_SET_EXTERNAL = [...PATH_VIEW, 'selection', 'setExternal'] as const;

export type ControlledDomain = 'filters' | 'exclusions' | 'encodings' | 'selection';

export interface GraphistryHandle {
  readonly rpc: RpcClient | null;
  readonly ready: boolean;
  readonly subscriptionAPIVersion: number | null;

  addFilter(expr: string): Promise<unknown>;
  resetFilters(): Promise<unknown>;
  setSelectionExternal(points: readonly number[], edges: readonly number[], darken?: boolean): Promise<unknown>;
}

interface InternalContext {
  stores: {
    selection: ExternalStore<SelectionSnapshot>;
    labels: ExternalStore<LabelsSnapshot>;
    filters: ExternalStore<FiltersSnapshot>;
  };
  handle: GraphistryHandle;
  controlled: ReadonlySet<ControlledDomain>;
  registerIframe: (iframe: HTMLIFrameElement | null) => void;
  sceneSrc: string;
}

const Ctx = createContext<InternalContext | null>(null);

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
    manager.register(PATH_SELECTION_LABELS, selection, projectSelection);
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
      if (typeof data.subscriptionAPIVersion === 'number') {
        setSubscriptionAPIVersion(data.subscriptionAPIVersion);
      }
      iframe.contentWindow?.postMessage(
        { type: 'graphistry-init-ack', agent: 'graphistryjs', subscriptionAPIVersion: SUBSCRIPTION_API_VERSION },
        '*'
      );
    };
    window.addEventListener('message', onMessage);
    const sendReady = () =>
      iframe.contentWindow?.postMessage(
        { type: 'ready', agent: 'graphistryjs', subscriptionAPIVersion: SUBSCRIPTION_API_VERSION },
        '*'
      );
    sendReady();
    iframe.addEventListener('load', sendReady);
    (iframe as HTMLIFrameElement & { __graphistryCleanup?: () => void }).__graphistryCleanup = () => {
      window.removeEventListener('message', onMessage);
      iframe.removeEventListener('load', sendReady);
    };
  }, [rpcTimeoutMs]);

  useEffect(() => {
    return () => {
      const iframe = iframeRef.current as (HTMLIFrameElement & { __graphistryCleanup?: () => void }) | null;
      iframe?.__graphistryCleanup?.();
      subs.current?.detachIframe();
      rpc?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handle = useMemo<GraphistryHandle>(() => ({
    rpc,
    ready: rpc !== null,
    subscriptionAPIVersion,
    addFilter: (expr) => {
      if (controlled.has('filters')) throw new GraphistryControlledError('filters', 'filters');
      if (!rpc) return Promise.reject(new Error('Graphistry iframe not yet mounted; wait for handle.ready.'));
      return rpc.call(PATH_FILTERS_ADD, [expr]);
    },
    resetFilters: () => {
      if (controlled.has('filters')) throw new GraphistryControlledError('filters', 'filters');
      if (!rpc) return Promise.reject(new Error('Graphistry iframe not yet mounted; wait for handle.ready.'));
      return rpc.call(PATH_FILTERS_RESET, []);
    },
    setSelectionExternal: (points, edges, darken) => {
      if (controlled.has('selection')) throw new GraphistryControlledError('selection', 'selection');
      if (!rpc) return Promise.reject(new Error('Graphistry iframe not yet mounted; wait for handle.ready.'));
      return rpc.call(PATH_SELECTION_SET_EXTERNAL, [Array.from(points), Array.from(edges), !!darken]);
    },
  }), [rpc, subscriptionAPIVersion, controlled]);

  const sceneSrc = useMemo(
    () => buildSceneSrc(props),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.host, props.dataset, props.src, props.params]
  );

  const value = useMemo<InternalContext>(() => ({
    stores,
    handle,
    controlled,
    registerIframe,
    sceneSrc,
  }), [stores, handle, controlled, registerIframe, sceneSrc]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGraphistryInternal(): InternalContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGraphistry* hooks must be used inside <GraphistryProvider>.');
  return ctx;
}

export function useGraphistry(): GraphistryHandle {
  return useGraphistryInternal().handle;
}

export interface GraphistrySceneProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src?: string;
}

export function GraphistryScene({ src, style, ...rest }: GraphistrySceneProps) {
  const ctx = useGraphistryInternal();
  const ref = useRef<HTMLIFrameElement | null>(null);

  const setRef = useCallback((el: HTMLIFrameElement | null) => {
    if (ref.current && ref.current !== el) {
      (ref.current as HTMLIFrameElement & { __graphistryCleanup?: () => void }).__graphistryCleanup?.();
      ctx.registerIframe(null);
    }
    ref.current = el;
    if (el) ctx.registerIframe(el);
  }, [ctx]);

  return (
    <iframe
      ref={setRef}
      src={src ?? ctx.sceneSrc}
      style={{ width: '100%', height: '100%', border: 'none', ...style }}
      allowFullScreen
      allow="fullscreen"
      {...rest}
    />
  );
}

/** Manual registration for callers mounting their own iframe. */
export function useGraphistryScene(): (iframe: HTMLIFrameElement | null) => void {
  return useGraphistryInternal().registerIframe;
}
