// End-to-end smoke test for @graphistry/client-api-context.
//
// Hit this app against a running Graphistry server. Override defaults via
// URL query string: ?host=my-graphistry.local&dataset=<id>

import { useState, type ReactNode } from 'react';
import {
  GraphistryProvider,
  GraphistryScene,
  useGraphistry,
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
// floating React panels remain visible:
//   type=arrow   — required by the dataset format
//   play=5000    — auto-start layout, skipping the splash screen
//   menu=false   — hides the top toolbar (also hides its popover panels)
//   info=false   — hides the session info bar
// See apps/core/viz/src/containers/view.js — `menu` and `info` default
// to true; falsey values collapse toolbarHeight to 0.
const SCENE_PARAMS = {
  type: 'arrow',
  play: 5000,
  menu: false,
  info: false,
};

// ---------- UI primitives ----------

function StatusDot({ tone }: { tone: 'ready' | 'pending' | 'error' }) {
  const cls = {
    ready:   'bg-brand-green shadow-[0_0_8px_rgba(72,187,120,0.6)]',
    pending: 'bg-amber-400 animate-pulse',
    error:   'bg-red-500',
  }[tone];
  return <span className={`inline-block size-2 rounded-full ${cls}`} aria-hidden />;
}

function Card({ title, right, children }: { title?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashboard-border bg-dashboard-surface/85 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
      {title && (
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-dashboard-border bg-dashboard-header/60">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-medium">{title}</h3>
          {right}
        </header>
      )}
      <div className="p-4 text-sm">{children}</div>
    </div>
  );
}

// ---------- Panels ----------

function ConnectionBadge() {
  const g = useGraphistry();
  const tone = g.ready ? 'ready' : 'pending';
  return (
    <div className="flex items-center gap-2 rounded-full border border-dashboard-border bg-dashboard-surface/85 backdrop-blur-md px-3 py-1.5 text-[11px] font-mono text-slate-400 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
      <StatusDot tone={tone} />
      <span>rpc.{g.ready ? 'ready' : 'waiting'}</span>
      <span className="text-dashboard-border">·</span>
      <span>v{g.subscriptionAPIVersion ?? '—'}</span>
    </div>
  );
}

function SelectionInspector() {
  const sel = useSelection();

  const right = (
    <div className="flex items-center gap-3 text-[11px] font-mono">
      <span className="text-brand-purple">{sel.points.length}P</span>
      <span className="text-brand-teal">{sel.edges.length}E</span>
    </div>
  );

  if (sel.error) {
    return (
      <Card title="Selection" right={<StatusDot tone="error" />}>
        <div className="rounded-md border border-red-900/60 bg-red-950/40 p-3 text-red-300 text-xs font-mono">
          {sel.error.message}
        </div>
      </Card>
    );
  }

  if (!sel.ready) {
    return (
      <Card title="Selection" right={<StatusDot tone="pending" />}>
        <div className="text-slate-400 text-xs">Waiting for first update…</div>
      </Card>
    );
  }

  if (sel.points.length + sel.edges.length === 0) {
    return (
      <Card title="Selection" right={right}>
        <div className="text-slate-400 text-xs">Click a node in the graph to inspect it.</div>
      </Card>
    );
  }

  return (
    <Card title="Selection" right={right}>
      <ul className="space-y-1 max-h-64 overflow-y-auto">
        {sel.pointLabels.slice(0, 30).map((l) => (
          <li key={`p-${l.globalIndex}`} className="flex items-baseline gap-3 font-mono text-xs">
            <span className="text-brand-purple tabular-nums w-12 shrink-0">#{l.globalIndex}</span>
            <span className="text-slate-50 truncate">{l.title}</span>
          </li>
        ))}
        {sel.edgeLabels.slice(0, 30).map((l) => (
          <li key={`e-${l.globalIndex}`} className="flex items-baseline gap-3 font-mono text-xs">
            <span className="text-brand-teal tabular-nums w-12 shrink-0">→{l.globalIndex}</span>
            <span className="text-slate-50 truncate">{l.title}</span>
          </li>
        ))}
      </ul>
    </Card>
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

  const right = (
    <span className="text-[11px] text-brand-teal font-mono">{filters.filters.length} active</span>
  );

  return (
    <Card title="Filters" right={right}>
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
          disabled={busy}
          onClick={() => run(() => filters.reset())}
          className="rounded-md border border-dashboard-border hover:bg-dashboard-header disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors"
        >
          Reset
        </button>
      </div>

      {filters.filters.length > 0 && (
        <ul className="mt-3 space-y-1">
          {filters.filters.map((f, i) => (
            <li
              key={f.id ?? i}
              className="flex items-center gap-2 rounded-md bg-dashboard-dark/60 border border-dashboard-border px-2.5 py-1.5"
            >
              <span className={`size-1.5 rounded-full ${f.enabled === false ? 'bg-slate-600' : 'bg-brand-green'}`} />
              <code className="flex-1 min-w-0 truncate text-xs font-mono text-slate-50">
                {f.query ?? f.name ?? `filter ${i}`}
              </code>
              {f.dataType && (
                <span className="text-[10px] uppercase tracking-wider text-slate-400">{f.dataType}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {lastError && (
        <div className="mt-3 rounded-md border border-red-900/60 bg-red-950/40 p-2.5 text-xs font-mono text-red-300">
          {lastError}
        </div>
      )}
    </Card>
  );
}

function HostFooter() {
  return (
    <div className="rounded-lg border border-dashboard-border bg-dashboard-surface/70 backdrop-blur-md px-3 py-2 text-[10px] font-mono text-slate-400 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
      <div className="flex gap-3">
        <span className="text-slate-500">host</span>
        <span className="text-slate-50 truncate">{HOST}</span>
      </div>
      <div className="flex gap-3">
        <span className="text-slate-500">dataset</span>
        <span className="text-slate-50 truncate">{DATASET}</span>
      </div>
    </div>
  );
}

// ---------- Layout ----------

export function App() {
  return (
    <GraphistryProvider host={HOST} dataset={DATASET} params={SCENE_PARAMS}>
      <div className="relative h-full w-full bg-dashboard-dark overflow-hidden">
        {/* Viz fills the whole viewport */}
        <GraphistryScene className="absolute inset-0 size-full" />

        {/* Top-left: logo */}
        <div className="absolute top-4 left-4 z-10 pointer-events-auto">
          <div className="flex items-center gap-2.5 rounded-full border border-dashboard-border bg-dashboard-surface/85 backdrop-blur-md px-3.5 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
            <div className="size-5 rounded-md bg-brand-teal/20 grid place-items-center">
              <div className="size-2 rounded-full bg-brand-teal shadow-[0_0_6px_rgba(79,209,197,0.8)]" />
            </div>
            <span className="text-xs font-semibold text-slate-50 tracking-tight">client-api-context</span>
          </div>
        </div>

        {/* Top-right: connection badge */}
        <div className="absolute top-4 right-4 z-10">
          <ConnectionBadge />
        </div>

        {/* Right rail: stacked panels */}
        <div className="absolute top-16 right-4 bottom-4 z-10 w-[380px] flex flex-col gap-3 pointer-events-auto overflow-y-auto pr-1">
          <SelectionInspector />
          <FilterBar />
          <div className="mt-auto">
            <HostFooter />
          </div>
        </div>
      </div>
    </GraphistryProvider>
  );
}
