// Right-rail panel that summarises the current selection.
//   - Empty selection: renders nothing.
//   - Single point / single edge: shows the focused label, its glyph, and
//     a compact key-value list of that entity's columns.
//   - Multiple: shows a collapsed list of the first 30 items per kind.
// The raw selection snapshot comes from `useSelection()`, which streams
// the viz's post-message selection updates through the Falcor Bridge.

import { useSelection } from '@graphistry/client-api-context';
import {
  EdgeGlyph,
  ErrorBox,
  KeyValueRow,
  Panel,
  PointGlyph,
  ScrollArea,
  StatusDot,
} from '../ui';

function rowLabel(l: { title?: string; label?: string; value?: unknown }): string {
  return (
    (typeof l.title === 'string' && l.title) ||
    (typeof l.label === 'string' && l.label) ||
    (l.value != null ? String(l.value) : '')
  );
}

type ColumnEntry = { key?: string; value?: unknown; dataType?: string };

function normalizeColumns(raw: unknown): ColumnEntry[] {
  if (!raw || typeof raw !== 'object') return [];
  const out: ColumnEntry[] = [];
  const keys = Object.keys(raw)
    .filter((k) => /^\d+$/.test(k))
    .map(Number)
    .sort((a, b) => a - b);
  for (const k of keys) {
    const entry = (raw as Record<string, ColumnEntry>)[String(k)];
    if (entry && typeof entry === 'object') out.push(entry);
  }
  if (out.length === 0) {
    for (const [k, v] of Object.entries(raw)) out.push({ key: k, value: v });
  }
  return out;
}

function formatColumnValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** Top-right rail slot. The panel self-positions so App.tsx stays clean. */
function Rail({ children }: { children: React.ReactNode }) {
  return <div className="absolute top-4 right-4 z-10 w-[380px]">{children}</div>;
}

export function SelectionInspector() {
  const sel = useSelection();

  if (sel.error) {
    return (
      <Rail>
        <Panel title="Selection" right={<StatusDot tone="error" />}>
          <ErrorBox>{sel.error.message}</ErrorBox>
        </Panel>
      </Rail>
    );
  }
  if (!sel.ready || sel.points.length + sel.edges.length === 0) return null;

  const onlyPoint = sel.points.length === 1 && sel.edges.length === 0 ? sel.pointLabels[0] : null;
  const onlyEdge = sel.edges.length === 1 && sel.points.length === 0 ? sel.edgeLabels[0] : null;
  const focused = onlyPoint ?? onlyEdge;

  if (focused) {
    const glyph = onlyPoint ? <PointGlyph /> : <EdgeGlyph />;
    const label = rowLabel(focused);
    const columns = normalizeColumns(focused.columns);
    return (
      <Rail>
        <Panel
          titleNode={
            <span className="flex items-center gap-2 text-text text-xs font-semibold normal-case tracking-normal truncate">
              {glyph}
              {label || (
                <span className="text-text-faint font-normal">
                  #{focused.globalIndex ?? focused.index ?? '?'}
                </span>
              )}
            </span>
          }
          bodyPad={false}
        >
          {columns.length === 0 ? (
            <div className="px-3 py-3 text-text-faint text-xs">No fields.</div>
          ) : (
            <ScrollArea className="max-h-80">
              <dl className="space-y-0.5 px-2 py-3">
                {columns.map((c, i) => (
                  <KeyValueRow
                    key={c.key ?? i}
                    keyText={c.key ?? `col ${i}`}
                    value={formatColumnValue(c.value)}
                    altIndex={i}
                  />
                ))}
              </dl>
            </ScrollArea>
          )}
        </Panel>
      </Rail>
    );
  }

  // Multi-selection: compact list.
  const total = sel.points.length + sel.edges.length;
  return (
    <Rail>
      <Panel
        titleNode={
          <span className="flex items-center gap-2 text-text text-xs font-semibold normal-case tracking-normal">
            <span className="text-text-faint font-normal">{total} selected</span>
          </span>
        }
        bodyPad={false}
      >
        <ScrollArea className="max-h-80">
          <ul className="space-y-1 px-3 py-3">
            {sel.pointLabels.slice(0, 30).map((l, i) => (
              <li
                key={`p-${l.globalIndex ?? l.index ?? i}`}
                className="flex items-center gap-2 font-mono text-xs"
              >
                <PointGlyph />
                <span className="text-text truncate">
                  {rowLabel(l) || `#${l.globalIndex ?? l.index ?? '?'}`}
                </span>
              </li>
            ))}
            {sel.edgeLabels.slice(0, 30).map((l, i) => (
              <li
                key={`e-${l.globalIndex ?? l.index ?? i}`}
                className="flex items-center gap-2 font-mono text-xs"
              >
                <EdgeGlyph />
                <span className="text-text truncate">
                  {rowLabel(l) || `→${l.globalIndex ?? l.index ?? '?'}`}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </Panel>
    </Rail>
  );
}
