// End-to-end smoke test for @graphistry/client-api-context — and the
// advertisement for how it's meant to be used. Entire integration is a
// provider, the iframe, and self-positioning panels. Business logic lives
// in the package hooks; UI primitives in ./ui; each panel under ./panels.

import { GraphistryProvider, GraphistryScene } from '@graphistry/client-api-context';
import { DATASET, HOST, SCENE_BG_HEX, SCENE_PARAMS } from './config';
import { SettingsDrawer } from './panels/SettingsDrawer';
import { SelectionInspector } from './panels/SelectionInspector';
import { FilterBar } from './panels/FilterBar';

export function App() {
  return (
    <GraphistryProvider host={HOST} dataset={DATASET} params={SCENE_PARAMS} bg={SCENE_BG_HEX}>
      <div className="relative h-full w-full bg-ink overflow-hidden">
        <GraphistryScene className="absolute inset-0 size-full" />
        <SettingsDrawer />
        <SelectionInspector />
        <FilterBar />
      </div>
    </GraphistryProvider>
  );
}
