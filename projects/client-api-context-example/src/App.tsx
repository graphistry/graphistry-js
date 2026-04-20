// End-to-end smoke test for @graphistry/client-api-context.
//
// Hit this app against a running Graphistry server. Override defaults via
// URL query string: ?host=my-graphistry.local&dataset=<id>

import { useState } from 'react';
import {
  GraphistryProvider,
  GraphistryScene,
  useSelection,
  useFilters,
  GraphistryControlledError,
  GraphistryRpcError,
} from '@graphistry/client-api-context';
import {
  Button,
  Chip,
  EdgeGlyph,
  ErrorBox,
  Input,
  KeyValueRow,
  Panel,
  PointGlyph,
  ScrollArea,
  StatusDot,
} from './ui';

const qs = new URLSearchParams(window.location.search);
const DEFAULT_HOST = `${window.location.hostname}:8491`;
const HOST = qs.get('host') ?? DEFAULT_HOST;
const DATASET = qs.get('dataset') ?? '539faecb680043a5ad8be679cab43117';

// iframe URL params that strip Graphistry's built-in chrome so only our
// floating React panels remain visible. Names come from
// apps/core/viz/server/clientParamSafelist.js.
const SCENE_PARAMS = {
  type: 'arrow',
  splashAfter: false,
  menu: false,
  info: false,
  showInspector: false,
  showHistograms: false,
};

// Applied over RPC once the iframe handshake completes — targets the
// live-reactive path scene.renderer.background.color. Token `ink` from
// index.css.
const SCENE_BG_HEX = '#0A0814';

// ------------------------- Data formatters -------------------------

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

// Filter query AST → readable expression.
type AstNode = { type: string; [k: string]: unknown };

function renderAst(node: unknown): string {
  if (node === null || node === undefined) return '';
  if (typeof node !== 'object') return String(node);
  const n = node as AstNode;
  switch (n.type) {
    case 'Literal':
      return n.dataType === 'string' ? JSON.stringify(n.value) : String(n.value);
    case 'Identifier':
      return String((n.name as string) ?? (n.value as string) ?? '?');
    case 'MemberExpression':
      return `${renderAst(n.object)}.${typeof n.property === 'string' ? n.property : renderAst(n.property)}`;
    case 'LimitExpression':
      return `LIMIT ${renderAst(n.value)}`;
    case 'BinaryExpression':
    case 'BinaryPredicate':
      return `${renderAst(n.left)} ${(n.operator as string) ?? (n.op as string) ?? '?'} ${renderAst(n.right)}`;
    case 'NotExpression':
      return `NOT ${renderAst(n.value)}`;
    case 'FunctionCall': {
      const name = (n.name as string) ?? (n.callee ? renderAst(n.callee) : 'fn');
      const args = ((n.arguments as AstNode[]) ?? []).map(renderAst).join(', ');
      return `${name}(${args})`;
    }
    default:
      try {
        return JSON.stringify(node);
      } catch {
        return String(n.type);
      }
  }
}

function filterDisplay(f: Record<string, unknown>, i: number): string {
  const q = f.query as { ast?: unknown; error?: unknown } | string | undefined;
  if (typeof q === 'string') return q;
  if (q && typeof q === 'object') {
    if (typeof q.error === 'string' && q.error) return `⚠ ${q.error}`;
    if (q.ast !== undefined) return renderAst(q.ast);
  }
  if (typeof f.name === 'string') return f.name;
  return `filter ${i}`;
}

// ------------------------- Panels -------------------------

function SelectionInspector() {
  const sel = useSelection();

  if (sel.error) {
    return (
      <Panel title="Selection" right={<StatusDot tone="error" />}>
        <ErrorBox>{sel.error.message}</ErrorBox>
      </Panel>
    );
  }
  if (!sel.ready) return null;
  if (sel.points.length + sel.edges.length === 0) return null;

  const onlyPoint =
    sel.points.length === 1 && sel.edges.length === 0 ? sel.pointLabels[0] : null;
  const onlyEdge =
    sel.edges.length === 1 && sel.points.length === 0 ? sel.edgeLabels[0] : null;
  const focused = onlyPoint ?? onlyEdge;

  if (focused) {
    const glyph = onlyPoint ? <PointGlyph /> : <EdgeGlyph />;
    const label = rowLabel(focused);
    const columns = normalizeColumns(focused.columns);
    const titleNode = (
      <span className="flex items-center gap-2 text-text text-xs font-semibold normal-case tracking-normal truncate">
        {glyph}
        {label || (
          <span className="text-text-faint font-normal">
            #{focused.globalIndex ?? focused.index ?? '?'}
          </span>
        )}
      </span>
    );
    return (
      <Panel titleNode={titleNode} bodyPad={false}>
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
    );
  }

  // Multi-selection: compact list.
  const total = sel.points.length + sel.edges.length;
  const titleNode = (
    <span className="flex items-center gap-2 text-text text-xs font-semibold normal-case tracking-normal">
      <span className="text-text-faint font-normal">{total} selected</span>
    </span>
  );
  return (
    <Panel titleNode={titleNode} bodyPad={false}>
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
  );
}

function FilterBar() {
  const filters = useFilters();
  const [expr, setExpr] = useState('point:degree > 1');
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setLastError(null);
    try {
      await action();
    } catch (err) {
      if (err instanceof GraphistryControlledError) {
        setLastError(`controlled: ${err.message}`);
      } else if (err instanceof GraphistryRpcError) {
        setLastError(`rpc.${err.kind}: ${err.message}`);
      } else {
        setLastError(String(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const count = filters.filters.length;

  const titleNode = (
    <span className="flex items-center gap-2">
      <h3 className="text-[11px] uppercase tracking-[0.14em] text-text-faint font-medium">
        Filters
      </h3>
      <span
        className={`text-[11px] font-mono ${count > 0 ? 'text-accent' : 'text-text-faint'}`}
      >
        {count} active
      </span>
    </span>
  );

  return (
    <Panel titleNode={titleNode} collapsible defaultOpen={false}>
      <div className="flex gap-2">
        <Input
          value={expr}
          onChange={setExpr}
          onSubmit={() => run(() => filters.add(expr))}
          placeholder="filter expression"
        />
        <Button
          variant="primary"
          disabled={busy}
          onClick={() => run(() => filters.add(expr))}
        >
          Add
        </Button>
        <Button
          variant="ghost"
          disabled={busy || count === 0}
          onClick={() => run(() => filters.reset())}
        >
          Reset
        </Button>
      </div>

      {count > 0 && (
        <ul className="mt-3 space-y-1 max-h-48 overflow-y-auto">
          {filters.filters.map((f, i) => (
            <Chip
              key={f.id ?? i}
              tone={f.enabled === false ? 'muted' : 'active'}
              right={
                <Button
                  variant="iconGhost"
                  disabled={busy || !f.id}
                  onClick={() => f.id && run(() => filters.remove(f.id!))}
                  title={f.id ? 'Remove filter' : 'Filter has no id; cannot remove'}
                  ariaLabel="Remove filter"
                >
                  ×
                </Button>
              }
            >
              {filterDisplay(f, i)}
            </Chip>
          ))}
        </ul>
      )}

      {lastError && (
        <div className="mt-3">
          <ErrorBox>{lastError}</ErrorBox>
        </div>
      )}
    </Panel>
  );
}

// ------------------------- Layout -------------------------

export function App() {
  return (
    <GraphistryProvider host={HOST} dataset={DATASET} params={SCENE_PARAMS} bg={SCENE_BG_HEX}>
      <div className="relative h-full w-full bg-ink overflow-hidden">
        {/* Viz fills the whole viewport */}
        <GraphistryScene className="absolute inset-0 size-full" />

        {/* Right rail: Selection panel on top, Filter panel pinned to bottom.
            The rail itself is pointer-events-none; each panel re-enables
            clicks on itself so empty space passes through to the viz. */}
        <div className="absolute top-4 right-0 bottom-4 z-10 w-[412px] px-4 pointer-events-none flex flex-col gap-3">
          <div className="shrink-0 pointer-events-auto">
            <SelectionInspector />
          </div>
          <div className="flex-1" />
          <div className="shrink-0 pointer-events-auto">
            <FilterBar />
          </div>
        </div>
      </div>
    </GraphistryProvider>
  );
}
