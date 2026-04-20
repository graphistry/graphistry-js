// Right-rail collapsible panel for managing filters. Reads the current list
// (plus the default LIMIT filter) via `useFilters()`, which streams updates
// through the Falcor Bridge's filter subscription. Mutations (add/remove/
// reset) go through the hook's imperative handlers; this panel just
// surfaces busy/error state and renders the AST of each filter compactly.

import { useState } from 'react';
import {
  useFilters,
  GraphistryControlledError,
  GraphistryRpcError,
} from '@graphistry/client-api-context';
import { Button, Chip, ErrorBox, Input, Panel } from '../ui';

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

export function FilterBar() {
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
    <div className="absolute bottom-4 right-4 z-10 w-[380px]">
      <Panel titleNode={titleNode} collapsible defaultOpen={false}>
        <div className="flex gap-2">
          <Input
            value={expr}
            onChange={setExpr}
            onSubmit={() => run(() => filters.add(expr))}
            placeholder="filter expression"
          />
          <Button variant="primary" disabled={busy} onClick={() => run(() => filters.add(expr))}>
            Add
          </Button>
          <Button variant="ghost" disabled={busy || count === 0} onClick={() => run(() => filters.reset())}>
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
    </div>
  );
}
