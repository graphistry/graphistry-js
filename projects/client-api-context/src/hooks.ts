// React hooks over the Graphistry context. Consumers never see
// useSyncExternalStore, rxjs, or falcor paths — just typed snapshots and
// Promise-returning mutators.

import { useContext, useSyncExternalStore } from 'react';
import type { SelectionSnapshot, LabelsSnapshot, FiltersSnapshot } from '@graphistry/client-api';
import { Ctx, type GraphistryHandle, type InternalContext } from './internal.js';
import { GraphistryControlledError } from './errors.js';

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
  reset(): Promise<unknown>;
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
    reset: () => {
      if (controlled.has('filters')) {
        return Promise.reject(new GraphistryControlledError('filters', 'filters'));
      }
      return handle.resetFilters();
    },
  };
}
