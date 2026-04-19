// Import from the scaffold to make sure the workspace link resolves.
// The hooks/provider currently throw — we don't call them yet.
import {
  GraphistryProvider as _GraphistryProvider,
  useGraphistry as _useGraphistry,
  useSelection as _useSelection,
} from '@graphistry/g-context';

// Silence unused-import warnings while the scaffold is empty.
void _GraphistryProvider;
void _useGraphistry;
void _useSelection;

export function App() {
  return <div>g-context-example — scaffold</div>;
}
