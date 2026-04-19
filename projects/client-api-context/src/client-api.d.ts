// Ambient types for the bits of @graphistry/client-api we consume.
// The upstream package ships untyped JS — these declarations give the
// React wrapper a type-safe boundary against the raw JS module.

declare module '@graphistry/client-api' {
  // ---------- RPC ----------
  export type GraphistryRpcErrorKind =
    | 'invalid_op'
    | 'internal'
    | 'timeout'
    | 'disposed'
    | (string & {});

  export interface GraphistryRpcErrorShape {
    kind?: GraphistryRpcErrorKind;
    op?: string;
    message?: string;
    [extra: string]: unknown;
  }

  export class GraphistryRpcError extends Error {
    readonly kind: GraphistryRpcErrorKind;
    readonly op: string;
    constructor(shape: GraphistryRpcErrorShape);
  }

  export interface RpcClient {
    call(path: readonly (string | number)[], args?: readonly unknown[]): Promise<unknown>;
    get(...paths: ReadonlyArray<readonly (string | number)[]>): Promise<unknown>;
    set(json: unknown): Promise<unknown>;
    dispose(): void;
  }

  export function createRpcClient(
    iframe: HTMLIFrameElement,
    options?: { timeoutMs?: number; window?: Window }
  ): RpcClient;

  // ---------- ExternalStore ----------
  export interface ExternalStoreOptions<T> {
    initial: T;
    arrayKeys?: ReadonlyArray<keyof T>;
    onFirstListener?: () => void;
    onLastListener?: () => void;
  }

  export class ExternalStore<T extends object> {
    constructor(options: ExternalStoreOptions<T>);
    subscribe(listener: () => void): () => void;
    getSnapshot(): T;
    update(incoming: T): void;
    setError(error: unknown): void;
  }

  // ---------- Subscription manager ----------
  export class SubscriptionManager {
    iframe: HTMLIFrameElement | null;
    register<T>(
      path: string,
      store: ExternalStore<T>,
      project: (raw: unknown) => T
    ): void;
    acquire(path: string): void;
    release(path: string): void;
    attachIframe(iframe: HTMLIFrameElement): void;
    detachIframe(): void;
  }

  // ---------- Errors ----------
  export class GraphistryPermissionError extends Error {
    readonly path: string;
    readonly flag?: string;
    constructor(opts: { path: string; flag?: string; message?: string });
  }

  // ---------- Snapshots ----------
  export interface LabelEntry {
    index: number;
    title: string;
    globalIndex: number;
    label?: string;
    value?: unknown;
    columns?: Record<string, unknown>;
  }

  export interface SelectionSnapshot {
    points: number[];
    edges: number[];
    pointLabels: LabelEntry[];
    edgeLabels: LabelEntry[];
    ready: boolean;
    error: GraphistryPermissionError | null;
  }

  export interface LabelsSnapshot {
    labels: LabelEntry[];
    ready: boolean;
    error: GraphistryPermissionError | null;
  }

  export interface FilterEntry {
    id?: string;
    query?: string;
    enabled?: boolean;
    name?: string;
    dataType?: string;
    level?: string;
  }

  export interface FiltersSnapshot {
    filters: FilterEntry[];
    ready: boolean;
    error: GraphistryPermissionError | null;
  }

  export const initialSelection: SelectionSnapshot;
  export const initialLabels: LabelsSnapshot;
  export const initialFilters: FiltersSnapshot;
  export function projectSelection(raw: unknown): SelectionSnapshot;
  export function projectLabels(raw: unknown): LabelsSnapshot;
  export function projectFilters(raw: unknown): FiltersSnapshot;

  // ---------- Path constants ----------
  export const PATH_SELECTION_LABELS: '.selection.labels';
  export const PATH_LABELS: '.labels';
  export const PATH_FILTERS: '.filters';
}
