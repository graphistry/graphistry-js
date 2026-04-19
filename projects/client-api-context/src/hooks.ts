// React hooks over the Graphistry context. Consumers never see
// useSyncExternalStore, rxjs, or falcor paths — just typed snapshots and
// Promise-returning mutators.

import { useSyncExternalStore } from 'react';
import type { SelectionSnapshot, LabelsSnapshot, FiltersSnapshot } from '@graphistry/client-api';
import { useGraphistryInternal } from './context.js';
import { GraphistryControlledError } from './errors.js';

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
