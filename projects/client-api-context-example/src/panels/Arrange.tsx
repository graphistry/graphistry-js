// Full-width "Arrange" toggle — runs or pauses the force-directed layout.
// Named for what the user sees ("Arrange my graph") rather than physics
// ("Simulate" / "Solve"). Writes `scene.simulating` AND mirrors into
// `scene.controls[0].selected` so the viz's own toolbar stays in sync.
// Local state only — no readback; a subscription-driven version would
// need `simulating` as a readOnly leaf in ClientAPIRoutes.

import { useState } from 'react';
import {
  useGraphistry,
  GraphistryRpcError,
} from '@graphistry/client-api-context';

const PATH_VIEW = ['workbooks', 'open', 'views', 'current'] as const;

function PlayGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
      <path d="M3 2 L10 6 L3 10 Z" fill="currentColor" />
    </svg>
  );
}

function PauseGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
      <rect x="3" y="2" width="2.4" height="8" fill="currentColor" rx="0.5" />
      <rect x="6.6" y="2" width="2.4" height="8" fill="currentColor" rx="0.5" />
    </svg>
  );
}

export function ArrangeButton() {
  const { rpc, ready } = useGraphistry();
  const [running, setRunning] = useState(false);

  const toggle = async () => {
    if (!rpc) return;
    const next = !running;
    setRunning(next);
    try {
      await rpc.set({
        paths: [
          [...PATH_VIEW, 'scene', 'simulating'],
          [...PATH_VIEW, 'scene', 'controls', 0, 'selected'],
        ],
        jsonGraph: {
          workbooks: {
            open: {
              views: {
                current: {
                  scene: { simulating: next, controls: { 0: { selected: next } } },
                },
              },
            },
          },
        },
      });
    } catch (err) {
      if (err instanceof GraphistryRpcError && (err as { kind?: string }).kind === 'disposed') return;
      console.warn('[Arrange] toggle failed', err);
      setRunning(!next); // revert on error
    }
  };

  // Both states carry a 2px border so toggling running doesn't nudge the
  // surrounding layout by a pixel. Idle paints a plain border-strong
  // stroke; running swaps in the animated conic-gradient ring from
  // `.arrange-active` (index.css).
  return (
    <button
      type="button"
      disabled={!ready}
      onClick={toggle}
      className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-[2px] ${
        running
          ? 'arrange-active text-accent'
          : 'bg-elevated border-border-strong text-text hover:bg-hover'
      }`}
    >
      {running ? <PauseGlyph /> : <PlayGlyph />}
      <span>{running ? 'Arranging…' : 'Arrange'}</span>
    </button>
  );
}
