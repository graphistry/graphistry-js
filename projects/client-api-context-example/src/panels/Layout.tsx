// ForceAtlas-2 tuning sliders. The parameter catalog is hardcoded because
// the server's `apps/core/viz/src/models/layout.js` declares these as
// literal constants that never change at runtime; round-tripping them
// through the Falcor Bridge for metadata would be dead weight. Writes go
// to `layout.options.forceatlas2barnes[i].value`, whitelisted write-only
// in ClientAPIRoutes.js. Prior attempts to read bounds via RPC triggered a
// stack overflow in the falcor router's route-matching when the nested
// `props.{min,max,step,scale}` branch was added to the whitelist (see
// feat/external-bridge); the fix is to not extend the whitelist at all.

import { useState } from 'react';
import {
  useSceneSetter,
  GraphistryRpcError,
} from '@graphistry/client-api-context';
import { PanelRow, SectionHeader, Slider, Toggle } from '../ui';

const PATH_FA2 = ['layout', 'options', 'forceatlas2barnes'] as const;

type Fa2ParamMeta =
  | {
      kind: 'number';
      name: string;
      default: number;
      min: number;
      max: number;
      step: number;
    }
  | {
      kind: 'bool';
      name: string;
      default: boolean;
    };

const FA2_PARAMS: Fa2ParamMeta[] = [
  { kind: 'number', name: 'Precision vs. Speed', default: -0.1, min: -5, max: 5, step: 0.1 },
  { kind: 'number', name: 'Center Magnet', default: 0.10471285480508996, min: 0, max: 100, step: 1 },
  { kind: 'number', name: 'Expansion Ratio', default: 0.10471285480508996, min: 0, max: 100, step: 1 },
  { kind: 'number', name: 'Edge Influence', default: 0, min: 0, max: 100, step: 1 },
  { kind: 'bool', name: 'Compact Layout', default: false },
  { kind: 'bool', name: 'Dissuade Hubs', default: false },
  { kind: 'bool', name: 'Strong Separation (LinLog)', default: false },
  { kind: 'bool', name: 'Locked X coordinates', default: false },
  { kind: 'bool', name: 'Locked Y coordinates', default: false },
  { kind: 'bool', name: 'Locked radius', default: false },
];

export function LayoutPanel() {
  const set = useSceneSetter();

  const [values, setValues] = useState<(number | boolean)[]>(() =>
    FA2_PARAMS.map((p) => p.default)
  );

  const writeValue = (idx: number, v: number | boolean) => {
    setValues((cur) => {
      const copy = cur.slice();
      copy[idx] = v;
      return copy;
    });
    set([...PATH_FA2, idx, 'value'], v).catch((err) => {
      if (err instanceof GraphistryRpcError && (err as { kind?: string }).kind === 'disposed') return;
      console.warn('[Layout] set failed', idx, err);
    });
  };

  return (
    <>
      <SectionHeader>Layout</SectionHeader>
      {FA2_PARAMS.map((p, i) => {
        if (p.kind === 'bool') {
          return (
            <PanelRow key={i} label={p.name} labelFill>
              <Toggle checked={!!values[i]} onChange={(v) => writeValue(i, v)} />
            </PanelRow>
          );
        }
        return (
          <PanelRow key={i} label={p.name}>
            <Slider
              value={typeof values[i] === 'number' ? (values[i] as number) : p.default}
              min={p.min}
              max={p.max}
              step={p.step}
              onChange={(v) => writeValue(i, v)}
            />
          </PanelRow>
        );
      })}
    </>
  );
}
