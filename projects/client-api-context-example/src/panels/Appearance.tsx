// Write-only control prototype for scene + label styling. Each control owns
// its local display state; changes post an RPC `set` envelope to the
// scene's falcor model via `useSceneSetter`. Defaults mirror the renderer's
// initial values so the UI is coherent at load even before any user
// interaction. A future pass can swap these for round-tripped subscriptions
// once the Falcor Bridge grows generic read support for these leaves.
//
// Paths are relative to `workbooks.open.views.current` (prepended inside
// `useSceneSetter`). See `apps/core/viz/src/models/scene/scene.js` for the
// reactive leaves; `scene.renderer.*` is the write path (not the `scene.bg`
// alias, which is a $ref).

import { useState } from 'react';
import {
  useSceneSetter,
  GraphistryRpcError,
} from '@graphistry/client-api-context';
import {
  ColorSwatch,
  PanelRow,
  SectionHeader,
  Select,
  Slider,
  Toggle,
} from '../ui';

const HIGHLIGHT_OPTIONS = [
  { value: 'both', label: 'Both directions' },
  { value: 'incoming', label: 'Incoming' },
  { value: 'outgoing', label: 'Outgoing' },
  { value: 'none', label: 'None' },
];

const PATH_RENDERER = ['scene', 'renderer'] as const;
const PATH_LABELS_SCENE = ['scene', 'labels'] as const;

export function AppearancePanel({ initialBg }: { initialBg: string }) {
  const set = useSceneSetter();

  // --- Scene ---
  const [bg, setBg] = useState(initialBg);
  const [showArrows, setShowArrows] = useState(true);
  const [pruneOrphans, setPruneOrphans] = useState(false);
  const [ptStroke, setPtStroke] = useState(4);
  const [ptScale, setPtScale] = useState(1);
  const [edScale, setEdScale] = useState(1);
  const [edCurve, setEdCurve] = useState(0.2);
  const [ptOpacity, setPtOpacity] = useState(1);
  const [edOpacity, setEdOpacity] = useState(1);
  const [nhHighlight, setNhHighlight] = useState('both');

  // --- Labels ---
  const [labelFg, setLabelFg] = useState('#ffffff');
  const [labelBg, setLabelBg] = useState('#2e2e2e');
  const [labelsEnabled, setLabelsEnabled] = useState(true);
  const [labelsShorten, setLabelsShorten] = useState(true);
  const [labelsOnHover, setLabelsOnHover] = useState(true);

  // Fire-and-forget writer; swallows expected StrictMode disposal errors.
  const write = (path: readonly string[], value: unknown) => {
    set(path, value).catch((err) => {
      if (err instanceof GraphistryRpcError && err.kind === 'disposed') return;
      console.warn('[Appearance] set failed', path.join('.'), err);
    });
  };

  return (
    <>
      <SectionHeader>Scene</SectionHeader>
      <PanelRow label="Background" labelFill>
        <ColorSwatch
          value={bg}
          onChange={(v) => {
            setBg(v);
            write([...PATH_RENDERER, 'background', 'color'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Show arrows" labelFill>
        <Toggle
          checked={showArrows}
          onChange={(v) => {
            setShowArrows(v);
            write([...PATH_RENDERER, 'showArrows'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Hide standalone" labelFill>
        <Toggle
          checked={pruneOrphans}
          onChange={(v) => {
            setPruneOrphans(v);
            write(['pruneOrphans'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Pt stroke">
        <Slider
          value={ptStroke}
          min={0}
          max={10}
          step={0.5}
          onChange={(v) => {
            setPtStroke(v);
            write([...PATH_RENDERER, 'points', 'stroke'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Pt size">
        <Slider
          value={ptScale}
          min={0.1}
          max={5}
          step={0.05}
          onChange={(v) => {
            setPtScale(v);
            write([...PATH_RENDERER, 'points', 'scaling'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Edge size">
        <Slider
          value={edScale}
          min={0.1}
          max={5}
          step={0.05}
          onChange={(v) => {
            setEdScale(v);
            write([...PATH_RENDERER, 'edges', 'scaling'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Curvature">
        <Slider
          value={edCurve}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => {
            setEdCurve(v);
            write([...PATH_RENDERER, 'edges', 'curvature'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Pt opacity">
        <Slider
          value={ptOpacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => {
            setPtOpacity(v);
            write([...PATH_RENDERER, 'points', 'opacity'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Edge opacity">
        <Slider
          value={edOpacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => {
            setEdOpacity(v);
            write([...PATH_RENDERER, 'edges', 'opacity'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Highlight">
        <Select
          value={nhHighlight}
          options={HIGHLIGHT_OPTIONS}
          onChange={(v) => {
            setNhHighlight(v);
            write([...PATH_RENDERER, 'points', 'neighborhoodHighlight'], v);
          }}
        />
      </PanelRow>

      <SectionHeader>Labels</SectionHeader>
      <PanelRow label="Text" labelFill>
        <ColorSwatch
          value={labelFg}
          onChange={(v) => {
            setLabelFg(v);
            write([...PATH_LABELS_SCENE, 'foreground', 'color'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Bg" labelFill>
        <ColorSwatch
          value={labelBg}
          onChange={(v) => {
            setLabelBg(v);
            write([...PATH_LABELS_SCENE, 'background', 'color'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Show labels" labelFill>
        <Toggle
          checked={labelsEnabled}
          onChange={(v) => {
            setLabelsEnabled(v);
            write([...PATH_LABELS_SCENE, 'enabled'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="Shorten" labelFill>
        <Toggle
          checked={labelsShorten}
          onChange={(v) => {
            setLabelsShorten(v);
            write([...PATH_LABELS_SCENE, 'shortenLabels'], v);
          }}
        />
      </PanelRow>
      <PanelRow label="On hover" labelFill>
        <Toggle
          checked={labelsOnHover}
          onChange={(v) => {
            setLabelsOnHover(v);
            write([...PATH_LABELS_SCENE, 'highlightEnabled'], v);
          }}
        />
      </PanelRow>
    </>
  );
}
