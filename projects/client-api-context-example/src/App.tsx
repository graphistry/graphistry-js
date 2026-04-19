// End-to-end smoke test for @graphistry/client-api-context.
//
// Hit this app against a running Graphistry server. Override defaults via
// URL query string: ?host=my-graphistry.local&dataset=Miserables

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
// Default to the same hostname this app is served from, on port 8491 — the
// dev Graphistry port in Alex's Tailscale setup (see deploy.md). Override
// with ?host=… to point anywhere else (e.g. hub.graphistry.com).
const DEFAULT_HOST = `${window.location.hostname}:8491`;
const HOST = qs.get('host') ?? DEFAULT_HOST;
const DATASET = qs.get('dataset') ?? 'Miserables';

function StatusDot({ tone }: { tone: 'ready' | 'pending' | 'error' }) {
  const cls = {
    ready:   'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    pending: 'bg-amber-400 animate-pulse',
    error:   'bg-red-500',
  }[tone];
  return <span className={`inline-block size-2 rounded-full ${cls}`} aria-hidden />;
}

function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/60 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/80">
        <h3 className="text-xs uppercase tracking-[0.14em] text-neutral-400 font-medium">{title}</h3>
        {right}
      </header>
      <div className="p-4 text-sm text-neutral-200">{children}</div>
    </section>
  );
}

function ConnectionStatus() {
  const g = useGraphistry();
  const tone = g.ready ? 'ready' : 'pending';
  return (
    <div className="flex items-center gap-2 text-xs text-neutral-400">
      <StatusDot tone={tone} />
      <span className="font-mono">
        rpc.{g.ready ? 'ready' : 'waiting'} · iframe.v{g.subscriptionAPIVersion ?? '—'}
      </span>
    </div>
  );
}

function SelectionInspector() {
  const sel = useSelection();

  const right = (
    <span className="text-xs text-neutral-500 font-mono">
      {sel.points.length}P · {sel.edges.length}E
    </span>
  );

  if (sel.error) {
    return (
      <Section title="Selection" right={<StatusDot tone="error" />}>
        <div className="rounded-md border border-red-900/60 bg-red-950/40 p-3 text-red-300 text-xs font-mono">
          {sel.error.message}
        </div>
      </Section>
    );
  }

  if (!sel.ready) {
    return (
      <Section title="Selection" right={<StatusDot tone="pending" />}>
        <div className="text-neutral-500 text-xs">Waiting for first update…</div>
      </Section>
    );
  }

  return (
    <Section title="Selection" right={right}>
      {sel.points.length + sel.edges.length === 0 ? (
        <div className="text-neutral-500 text-xs">Nothing selected. Click a node in the graph.</div>
      ) : (
        <ul className="space-y-1 max-h-60 overflow-y-auto">
          {sel.pointLabels.slice(0, 20).map((l) => (
            <li key={`p-${l.globalIndex}`} className="flex items-baseline gap-3 font-mono text-xs">
              <span className="text-neutral-500 tabular-nums">#{l.globalIndex}</span>
              <span className="text-neutral-200 truncate">{l.title}</span>
            </li>
          ))}
          {sel.edgeLabels.slice(0, 20).map((l) => (
            <li key={`e-${l.globalIndex}`} className="flex items-baseline gap-3 font-mono text-xs">
              <span className="text-sky-500 tabular-nums">→{l.globalIndex}</span>
              <span className="text-neutral-300 truncate">{l.title}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
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
    <span className="text-xs text-neutral-500 font-mono">{filters.filters.length} active</span>
  );

  return (
    <Section title="Filters" right={right}>
      <div className="flex gap-2">
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') run(() => filters.add(expr)); }}
          className="flex-1 min-w-0 rounded-md bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
          placeholder="filter expression"
          spellCheck={false}
        />
        <button
          disabled={busy}
          onClick={() => run(() => filters.add(expr))}
          className="rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-medium text-white transition-colors"
        >
          Add
        </button>
        <button
          disabled={busy}
          onClick={() => run(() => filters.reset())}
          className="rounded-md border border-neutral-800 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors"
        >
          Reset
        </button>
      </div>

      {filters.filters.length > 0 && (
        <ul className="mt-3 space-y-1">
          {filters.filters.map((f, i) => (
            <li key={f.id ?? i} className="flex items-center gap-2 rounded-md bg-neutral-950/60 border border-neutral-800 px-2.5 py-1.5">
              <span className={`size-1.5 rounded-full ${f.enabled === false ? 'bg-neutral-600' : 'bg-emerald-500'}`} />
              <code className="flex-1 min-w-0 truncate text-xs font-mono text-neutral-300">
                {f.query ?? f.name ?? `filter ${i}`}
              </code>
              {f.dataType && (
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">{f.dataType}</span>
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
    </Section>
  );
}

function ConnectionFooter() {
  return (
    <div className="mt-auto pt-4 border-t border-neutral-800 text-[11px] text-neutral-500 font-mono space-y-0.5">
      <div>host <span className="text-neutral-400">{HOST}</span></div>
      <div>dataset <span className="text-neutral-400">{DATASET}</span></div>
      <div className="text-neutral-600">override with ?host=…&dataset=…</div>
    </div>
  );
}

export function App() {
  return (
    <GraphistryProvider host={HOST} dataset={DATASET}>
      <div className="flex h-full w-full bg-neutral-950 text-neutral-200">
        <main className="relative flex-1 min-w-0">
          <GraphistryScene className="absolute inset-0 size-full" />
        </main>

        <aside className="flex flex-col w-[420px] flex-shrink-0 border-l border-neutral-800 bg-neutral-950">
          <header className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
            <div>
              <h1 className="text-sm font-semibold text-neutral-100 tracking-tight">
                client-api-context
              </h1>
              <p className="text-[11px] text-neutral-500">React hooks over Graphistry</p>
            </div>
            <ConnectionStatus />
          </header>

          <div className="flex-1 flex flex-col gap-4 p-5 overflow-y-auto">
            <SelectionInspector />
            <FilterBar />
            <ConnectionFooter />
          </div>
        </aside>
      </div>
    </GraphistryProvider>
  );
}
