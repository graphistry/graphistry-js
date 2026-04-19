// React provider + hooks over @graphistry/client-api.
// The framework-agnostic primitives (ExternalStore, SubscriptionManager,
// projections, GraphistryRpcError, GraphistryPermissionError) live in
// @graphistry/client-api and are re-exported here for one-import-site
// convenience.

export {
  GraphistryProvider,
  GraphistryScene,
  useGraphistry,
  useGraphistryScene,
} from './context.js';
export type {
  GraphistryProviderProps,
  GraphistrySceneProps,
  GraphistryHandle,
  ControlledDomain,
} from './context.js';

export { useSelection, useLabels, useFilters } from './hooks.js';
export type { UseFiltersReturn } from './hooks.js';

// Re-exports from @graphistry/client-api so consumers only import from here.
export {
  GraphistryRpcError,
  GraphistryPermissionError,
  GraphistryControlledError,
} from './errors.js';
export type {
  SelectionSnapshot,
  LabelsSnapshot,
  FiltersSnapshot,
  LabelEntry,
  FilterEntry,
} from '@graphistry/client-api';
