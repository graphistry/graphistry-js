// End-to-end smoke test for @graphistry/client-api-context.
//
// Hit this app against a running Graphistry server. Override defaults via
// URL query string: ?host=my-graphistry.local&dataset=<id>

import { useState, type ReactNode } from 'react';
import {
  GraphistryProvider,
  GraphistryScene,
  useSelection,
  useFilters,
  GraphistryControlledError,
  GraphistryRpcError,
} from '@graphistry/client-api-context';

const qs = new URLSearchParams(window.location.search);
const DEFAULT_HOST = `${window.location.hostname}:8491`;
const HOST = qs.get('host') ?? DEFAULT_HOST;
const DATASET = qs.get('dataset') ?? '539faecb680043a5ad8be679cab43117';

// iframe URL params that strip Graphistry's built-in chrome so only our
// floating React panels remain visible. Names come from
// apps/core/viz/server/clientParamSafelist.js (legacySafelist + interimSafelist).
//   type=arrow          — required by the dataset format
//   splashAfter=false   — skips the splash screen entirely (server/splash.js:13)
//   menu=false          — hides the top toolbar (containers/view.js:104 collapses toolbarHeight)
//   info=false          — hides the session info bar
//   showInspector=false — hides the right-side entity inspector panel
//   showHistograms=false — hides the bottom-right histogram adder
const SCENE_PARAMS = {
  type: 'arrow',
  splashAfter: false,
  menu: false,
  info: false,
  showInspector: false,
  showHistograms: false,
};

// Dashboard-dark surface from index.css — matches the panel background so
// the iframe blends into the rest of the app. Applied via RPC against the
// v2 whitelist route `scene.bg.color` (see viz/src/client/falcor/ClientAPIRoutes.js).
const SCENE_BG_HEX = '#0B0C14';

// Filters' `query` field arrives as `{ ast, error }` — the parsed Graphistry
// query expression, not the original source string. Walk the AST into a
// readable form. Unknown node types fall back to JSON so nothing renders
// blank if the schema grows new shapes we haven't taught about.
type AstNode =
  | { type: 'Literal'; value: unknown; dataType?: string }
  | { type: 'Identifier'; name?: string; value?: string }
  | { type: 'MemberExpression'; object?: AstNode; property?: AstNode | string }
  | { type: 'LimitExpression'; value: AstNode }
  | { type: 'BinaryExpression' | 'BinaryPredicate'; operator?: string; op?: string; left: AstNode; right: AstNode }
  | { type: 'NotExpression'; value: AstNode }
  | { type: 'FunctionCall'; name?: string; callee?: AstNode; arguments?: AstNode[] }
  | { type: string; [k: string]: unknown };

function renderAst(node: unknown): string {
  if (node === null || node === undefined) return '';
  if (typeof node !== 'object') return String(node);
  const n = node as AstNode;
  switch (n.type) {
    case 'Literal':
      return n.dataType === 'string' ? JSON.stringify(n.value) : String(n.value);
    case 'Identifier':
      return String(n.name ?? n.value ?? '?');
    case 'MemberExpression':
      return `${renderAst(n.object)}.${typeof n.property === 'string' ? n.property : renderAst(n.property)}`;
    case 'LimitExpression':
      return `LIMIT ${renderAst(n.value)}`;
    case 'BinaryExpression':
    case 'BinaryPredicate':
      return `${renderAst(n.left)} ${n.operator ?? n.op ?? '?'} ${renderAst(n.right)}`;
    case 'NotExpression':
      return `NOT ${renderAst(n.value)}`;
    case 'FunctionCall': {
      const name = n.name ?? (n.callee ? renderAst(n.callee) : 'fn');
      const args = (n.arguments ?? []).map(renderAst).join(', ');
      return `${name}(${args})`;
    }
    default:
      try { return JSON.stringify(node); } catch { return String(n.type); }
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

// ---------- UI primitives ----------

function StatusDot({ tone }: { tone: 'ready' | 'pending' | 'error' }) {
  const cls = {
    ready:   'bg-brand-green shadow-[0_0_8px_rgba(72,187,120,0.6)]',
    pending: 'bg-amber-400 animate-pulse',
    error:   'bg-red-500',
  }[tone];
  return <span className={`inline-block size-2 rounded-full ${cls}`} aria-hidden />;
}

function Card({ title, titleNode, right, children, bodyPad = true }: { title?: string; titleNode?: ReactNode; right?: ReactNode; children: ReactNode; bodyPad?: boolean }) {
  const hasHeader = title !== undefined || titleNode !== undefined || right !== undefined;
  return (
    <div className="rounded-xl border border-dashboard-border bg-dashboard-surface/85 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
      {hasHeader && (
        <header className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-dashboard-border bg-dashboard-header/60">
          {titleNode ?? <h3 className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-medium">{title}</h3>}
          {right}
        </header>
      )}
      {/* Body: callers opt out of padding when they own a scroll region so
          the scrollbar meets the card border and padding lives inside the
          scrollable content. */}
      <div className={bodyPad ? 'p-4 text-sm' : 'text-sm'}>{children}</div>
    </div>
  );
}

// Heuristic: render key | value on one flex row when both fit. Long values
// drop to a second line so big integers / strings never overflow the card.
// The threshold is tuned to the rail's content width (roughly 34 chars on
// 412px - 32 inner px at the 11px font).
function ColumnRow({ c, i }: { c: ColumnEntry; i: number }) {
  const keyStr = c.key ?? `col ${i}`;
  const valStr = formatColumnValue(c.value);
  const inline = keyStr.length + valStr.length <= 34 && !valStr.includes('\n');
  const rowCls = 'rounded px-2 py-1 odd:bg-slate-500/[0.04] min-w-0';
  if (inline) {
    return (
      <div className={`${rowCls} flex items-baseline gap-3`}>
        <dt className="text-slate-400 text-[11px] shrink-0 truncate max-w-[40%]">{keyStr}</dt>
        <dd className="text-slate-50 text-xs font-mono flex-1 min-w-0 text-right truncate">{valStr}</dd>
      </div>
    );
  }
  return (
    <div className={rowCls}>
      <dt className="text-slate-400 text-[10px] uppercase tracking-wider truncate">{keyStr}</dt>
      <dd className="text-slate-50 text-xs font-mono break-all mt-0.5">{valStr}</dd>
    </div>
  );
}

// ---------- Panels ----------

// Row titles can be blank until the iframe labels pipeline finishes hydrating.
function rowLabel(l: { title?: string; label?: string; value?: unknown }): string {
  return (typeof l.title === 'string' && l.title)
    || (typeof l.label === 'string' && l.label)
    || (l.value != null ? String(l.value) : '');
}

// Viz columns for a selected row arrive as a pseudo-array object:
//   { 0: { key, value, dataType }, 1: {...}, ... }
// Normalize into a list of {key, value, dataType} entries.
type ColumnEntry = { key?: string; value?: unknown; dataType?: string };
function normalizeColumns(raw: unknown): ColumnEntry[] {
  if (!raw || typeof raw !== 'object') return [];
  const out: ColumnEntry[] = [];
  const keys = Object.keys(raw).filter((k) => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
  for (const k of keys) {
    const entry = (raw as Record<string, ColumnEntry>)[String(k)];
    if (entry && typeof entry === 'object') out.push(entry);
  }
  if (out.length === 0) {
    // Fallback: treat each key as a column name.
    for (const [k, v] of Object.entries(raw)) out.push({ key: k, value: v });
  }
  return out;
}

function formatColumnValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  try { return JSON.stringify(v); } catch { return String(v); }
}

// Small svg glyphs so the title bar has a shape instead of text when the
// selected thing has no label.
function PointGlyph() {
  return <span className="inline-block size-2 rounded-full bg-brand-purple shadow-[0_0_6px_rgba(107,90,237,0.7)]" aria-label="point" />;
}
function EdgeGlyph() {
  return (
    <svg width="14" height="8" viewBox="0 0 14 8" className="text-brand-teal" aria-label="edge">
      <path d="M1 4 H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 1 L13 4 L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function SelectionInspector() {
  const sel = useSelection();

  if (sel.error) {
    return (
      <Card title="Selection" right={<StatusDot tone="error" />}>
        <div className="rounded-md border border-red-900/60 bg-red-950/40 p-3 text-red-300 text-xs font-mono">
          {sel.error.message}
        </div>
      </Card>
    );
  }
  // Hide the panel entirely when idle — before first update and while nothing
  // is selected, we don't want a floating card over the viz.
  if (!sel.ready) return null;
  if (sel.points.length + sel.edges.length === 0) return null;

  const onlyPoint = sel.points.length === 1 && sel.edges.length === 0 ? sel.pointLabels[0] : null;
  const onlyEdge = sel.edges.length === 1 && sel.points.length === 0 ? sel.edgeLabels[0] : null;
  const focused = onlyPoint ?? onlyEdge;

  // Single-selection: title bar carries the row's own label + glyph, and the
  // body is a key/value table over its columns.
  if (focused) {
    const glyph = onlyPoint ? <PointGlyph /> : <EdgeGlyph />;
    const label = rowLabel(focused);
    const columns = normalizeColumns(focused.columns);
    const titleNode = (
      <span className="flex items-center gap-2 text-slate-50 text-xs font-semibold normal-case tracking-normal truncate">
        {glyph}
        {label || <span className="text-slate-400 font-normal">#{focused.globalIndex ?? focused.index ?? '?'}</span>}
      </span>
    );
    return (
      <Card titleNode={titleNode} bodyPad={false}>
        {columns.length === 0 ? (
          <div className="px-4 py-4 text-slate-400 text-xs">No fields.</div>
        ) : (
          <ScrollFade className="max-h-80">
            <dl className="space-y-0.5 px-2 py-3">
              {columns.map((c, i) => (
                <ColumnRow key={c.key ?? i} c={c} i={i} />
              ))}
            </dl>
          </ScrollFade>
        )}
      </Card>
    );
  }

  // Multi-selection: compact list, no P/E counter.
  const total = sel.points.length + sel.edges.length;
  const titleNode = (
    <span className="flex items-center gap-2 text-slate-50 text-xs font-semibold normal-case tracking-normal">
      <span className="text-slate-400 font-normal">{total} selected</span>
    </span>
  );
  return (
    <Card titleNode={titleNode} bodyPad={false}>
      <ScrollFade className="max-h-80">
        <ul className="space-y-1 px-4 py-3">
          {sel.pointLabels.slice(0, 30).map((l, i) => (
            <li key={`p-${l.globalIndex ?? l.index ?? i}`} className="flex items-center gap-2 font-mono text-xs">
              <PointGlyph />
              <span className="text-slate-50 truncate">{rowLabel(l) || `#${l.globalIndex ?? l.index ?? '?'}`}</span>
            </li>
          ))}
          {sel.edgeLabels.slice(0, 30).map((l, i) => (
            <li key={`e-${l.globalIndex ?? l.index ?? i}`} className="flex items-center gap-2 font-mono text-xs">
              <EdgeGlyph />
              <span className="text-slate-50 truncate">{rowLabel(l) || `→${l.globalIndex ?? l.index ?? '?'}`}</span>
            </li>
          ))}
        </ul>
      </ScrollFade>
    </Card>
  );
}

// Scrollable wrapper with soft top/bottom fade masks. mask-image does the
// heavy lifting — the fade hints at overflowed content without adding any
// extra DOM or pointer-events hazards.
function ScrollFade({ className, children }: { className?: string; children: ReactNode }) {
  const mask = 'linear-gradient(to bottom, transparent 0, black 14px, black calc(100% - 14px), transparent 100%)';
  return (
    <div
      className={`overflow-y-auto ${className ?? ''}`}
      style={{ WebkitMaskImage: mask, maskImage: mask }}
    >
      {children}
    </div>
  );
}

function FilterBar() {
  const filters = useFilters();
  const [expr, setExpr] = useState('point:degree > 1');
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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

  return (
    <div className="rounded-xl border border-dashboard-border bg-dashboard-surface/85 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 border-b border-dashboard-border bg-dashboard-header/60 hover:bg-dashboard-header/80 transition-colors"
      >
        <span className="flex items-center gap-2">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-medium">Filters</h3>
          <span className={`text-[11px] font-mono ${count > 0 ? 'text-brand-teal' : 'text-slate-500'}`}>{count} active</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden>
          <path d="M3 4.5 L6 7.5 L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="p-4 text-sm">
          <div className="flex gap-2">
            <input
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') run(() => filters.add(expr)); }}
              className="flex-1 min-w-0 rounded-md bg-dashboard-dark/80 border border-dashboard-border px-3 py-1.5 text-xs font-mono text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-colors"
              placeholder="filter expression"
              spellCheck={false}
            />
            <button
              disabled={busy}
              onClick={() => run(() => filters.add(expr))}
              className="rounded-md bg-brand-teal hover:bg-brand-teal/90 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-dashboard-dark transition-colors"
            >
              Add
            </button>
            <button
              disabled={busy || count === 0}
              onClick={() => run(() => filters.reset())}
              className="rounded-md border border-dashboard-border hover:bg-dashboard-header disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors"
            >
              Reset
            </button>
          </div>

          {count > 0 && (
            <ul className="mt-3 space-y-1 max-h-48 overflow-y-auto">
              {filters.filters.map((f, i) => (
                <li
                  key={f.id ?? i}
                  className="group flex items-center gap-2 rounded-md bg-dashboard-dark/60 border border-dashboard-border px-2.5 py-1.5"
                >
                  <span className={`size-1.5 rounded-full ${f.enabled === false ? 'bg-slate-600' : 'bg-brand-green'}`} />
                  <code className="flex-1 min-w-0 truncate text-xs font-mono text-slate-50">
                    {filterDisplay(f, i)}
                  </code>
                  {f.dataType && (
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">{f.dataType}</span>
                  )}
                  <button
                    disabled={busy || !f.id}
                    onClick={() => f.id && run(() => filters.remove(f.id!))}
                    title={f.id ? 'Remove filter' : 'Filter has no id; cannot remove'}
                    className="opacity-40 group-hover:opacity-100 hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400 text-sm leading-none transition-opacity"
                    aria-label="Remove filter"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {lastError && (
            <div className="mt-3 rounded-md border border-red-900/60 bg-red-950/40 p-2.5 text-xs font-mono text-red-300">
              {lastError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Layout ----------

export function App() {
  return (
    <GraphistryProvider host={HOST} dataset={DATASET} params={SCENE_PARAMS} bg={SCENE_BG_HEX}>
      <div className="relative h-full w-full bg-dashboard-dark overflow-hidden">
        {/* Viz fills the whole viewport */}
        <GraphistryScene className="absolute inset-0 size-full" />

        {/* Right rail: Selection panel sits at the top (grows, scrolls internally);
            Filter panel pinned to the bottom edge as a collapsible strip.
            Outer wrapper + spacer are pointer-events-none so empty space passes
            clicks through to the iframe; each panel re-enables pointer events. */}
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
