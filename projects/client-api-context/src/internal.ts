// Shared context object + types. Split out of context.tsx so that file
// only exports components (Provider, Scene), which keeps React Fast Refresh
// happy — mixing component exports with hook/non-component exports bails.

import { createContext } from 'react';
import type {
  ExternalStore,
  RpcClient,
  SelectionSnapshot,
  LabelsSnapshot,
  FiltersSnapshot,
} from '@graphistry/client-api';

export type ControlledDomain = 'filters' | 'exclusions' | 'encodings' | 'selection';

export interface GraphistryHandle {
  readonly rpc: RpcClient | null;
  readonly ready: boolean;
  readonly subscriptionAPIVersion: number | null;
  addFilter(expr: string): Promise<unknown>;
  removeFilter(id: string): Promise<unknown>;
  resetFilters(): Promise<unknown>;
  setSelectionExternal(points: readonly number[], edges: readonly number[], darken?: boolean): Promise<unknown>;
}

export interface InternalContext {
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

export const Ctx = createContext<InternalContext | null>(null);
