// End-to-end smoke test for @graphistry/client-api-context.
//
// Hit this app against a running Graphistry server. Override defaults via
// URL query string: ?host=my-graphistry.local&dataset=Miserables

import { useState } from 'react';
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
const HOST = qs.get('host') ?? 'hub.graphistry.com';
const DATASET = qs.get('dataset') ?? 'Miserables';

function ConnectionStatus() {
  const g = useGraphistry();
  return (
    <div style={styles.statusRow}>
      <span>
        RPC: {g.ready ? 'ready' : 'waiting'} · iframe v{g.subscriptionAPIVersion ?? '—'}
      </span>
    </div>
  );
}

function SelectionInspector() {
  const sel = useSelection();
  if (sel.error) return <div style={styles.error}>Selection error: {sel.error.message}</div>;
  if (!sel.ready) return <div>Selection: waiting for first update…</div>;
  return (
    <div>
      <div>{sel.points.length} points · {sel.edges.length} edges selected</div>
      {sel.pointLabels.slice(0, 3).map((l) => (
        <div key={l.globalIndex} style={styles.labelRow}>
          #{l.globalIndex} {l.title}
        </div>
      ))}
    </div>
  );
}

function FilterBar() {
  const filters = useFilters();
  const [expr, setExpr] = useState('point:degree > 1');
  const [lastError, setLastError] = useState<string | null>(null);

  const onAdd = async () => {
    setLastError(null);
    try {
      await filters.add(expr);
    } catch (err) {
      if (err instanceof GraphistryControlledError) {
        setLastError(`controlled: ${err.message}`);
      } else if (err instanceof GraphistryRpcError) {
        setLastError(`rpc(${err.kind}): ${err.message}`);
      } else {
        setLastError(String(err));
      }
    }
  };

  const onReset = async () => {
    setLastError(null);
    try {
      await filters.reset();
    } catch (err) {
      setLastError(String(err));
    }
  };

  return (
    <div style={styles.filterBar}>
      <input
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        style={styles.input}
        placeholder="filter expression"
      />
      <button onClick={onAdd}>Add filter</button>
      <button onClick={onReset}>Reset</button>
      <div style={styles.filterList}>
        <strong>Active filters ({filters.filters.length}):</strong>
        {filters.filters.map((f, i) => (
          <div key={f.id ?? i}>· {f.query ?? f.name ?? `filter ${i}`}</div>
        ))}
      </div>
      {lastError && <div style={styles.error}>{lastError}</div>}
    </div>
  );
}

export function App() {
  return (
    <GraphistryProvider host={HOST} dataset={DATASET}>
      <div style={styles.layout}>
        <div style={styles.sceneCol}>
          <GraphistryScene />
        </div>
        <div style={styles.sideCol}>
          <h2>client-api-context smoke test</h2>
          <ConnectionStatus />
          <section>
            <h3>Selection</h3>
            <SelectionInspector />
          </section>
          <section>
            <h3>Filters</h3>
            <FilterBar />
          </section>
          <section style={styles.hint}>
            host: <code>{HOST}</code> · dataset: <code>{DATASET}</code>
          </section>
        </div>
      </div>
    </GraphistryProvider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', height: '100vh' },
  sceneCol: { height: '100vh' },
  sideCol: { padding: 16, overflowY: 'auto', fontFamily: 'system-ui, sans-serif', fontSize: 14 },
  statusRow: { fontFamily: 'monospace', fontSize: 12, color: '#666' },
  labelRow: { fontFamily: 'monospace', fontSize: 12 },
  filterBar: { display: 'flex', flexDirection: 'column', gap: 8 },
  input: { padding: 6, fontFamily: 'monospace', fontSize: 12 },
  filterList: { fontSize: 12, marginTop: 8 },
  error: { color: '#b00', fontSize: 12, marginTop: 8 },
  hint: { marginTop: 'auto', fontSize: 11, color: '#888' },
};
