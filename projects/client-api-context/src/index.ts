// React provider + hooks over @graphistry/client-api.
// Framework-agnostic primitives (ExternalStore, SubscriptionManager,
// projections, GraphistryRpcError, GraphistryPermissionError) live in
// @graphistry/client-api; re-exported here for one-import convenience.

export { GraphistryProvider, GraphistryScene } from './context.js';
export type {
  GraphistryProviderProps,
  GraphistrySceneProps,
} from './context.js';

export {
  useGraphistry,
  useGraphistryScene,
  useSelection,
  useLabels,
  useFilters,
  useSceneSetter,
  useSceneValue,
  useSceneValues,
  useColumns,
  usePalettes,
  useEncoding,
  getEncodingMeta,
  columnsForEncoding,
} from './hooks.js';
export type {
  UseFiltersReturn,
  SceneReadState,
  ColumnMeta,
  Palette,
  EncodingKind,
  UseEncodingReturn,
} from './hooks.js';

export type { GraphistryHandle, ControlledDomain } from './internal.js';

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
