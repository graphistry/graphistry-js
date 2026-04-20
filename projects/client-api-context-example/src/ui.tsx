// UI primitives for the client-api-context example.
//
// Tokens live in index.css (@theme). Keep this file component-only — no
// business logic, no data fetching — so composition in App.tsx reads as
// "panels + rows filled with data from hooks".

import { useState, type ReactNode } from 'react';

// ---------- Glyphs ----------

export function PointGlyph() {
  return (
    <span
      className="inline-block size-2 rounded-full bg-point shadow-[0_0_6px_rgba(146,133,204,0.5)]"
      aria-label="point"
    />
  );
}

export function EdgeGlyph() {
  return (
    <svg width="14" height="8" viewBox="0 0 14 8" className="text-edge" aria-label="edge">
      <path d="M1 4 H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 1 L13 4 L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function StatusDot({ tone }: { tone: 'ready' | 'pending' | 'error' }) {
  const cls = {
    ready: 'bg-ok shadow-[0_0_8px_rgba(126,212,163,0.45)]',
    pending: 'bg-warn animate-pulse',
    error: 'bg-err',
  }[tone];
  return <span className={`inline-block size-2 rounded-full ${cls}`} aria-hidden />;
}

// ---------- Panel ----------

export interface PanelProps {
  title?: string;
  titleNode?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  /** Whether to wrap body content in `p-3`. Set false when children own
   *  their own padding (typically a `ScrollArea` that paints to the edges). */
  bodyPad?: boolean;
  /** When true, the header becomes a toggle and body is collapsed by default
   *  (or per `defaultOpen`). `right` is rendered next to the chevron. */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function Panel({
  title,
  titleNode,
  right,
  children,
  bodyPad = true,
  collapsible = false,
  defaultOpen = true,
}: PanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = !collapsible || open;
  const hasHeader =
    title !== undefined || titleNode !== undefined || right !== undefined || collapsible;

  const header = (
    <>
      {titleNode ??
        (title ? (
          <h3 className="text-[11px] uppercase tracking-[0.14em] text-text-faint font-medium">
            {title}
          </h3>
        ) : null)}
      {collapsible ? (
        <span className="flex items-center gap-3">
          {right}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className={`text-text-dim transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          >
            <path
              d="M2 3.5 L5 6.5 L8 3.5"
              stroke="currentColor"
              strokeWidth="1.3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : (
        right
      )}
    </>
  );

  return (
    <div className="rounded border border-border bg-surface/85 backdrop-blur-md shadow-[0_6px_24px_rgba(0,0,0,0.45)] overflow-hidden">
      {hasHeader &&
        (collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 border-b border-border bg-elevated/60 hover:bg-hover/70 transition-colors"
          >
            {header}
          </button>
        ) : (
          <header className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border bg-elevated/60">
            {header}
          </header>
        ))}
      {isOpen && <div className={bodyPad ? 'p-3 text-sm' : 'text-sm'}>{children}</div>}
    </div>
  );
}

// ---------- ScrollArea ----------

/** Vertically scrollable region with soft mask-image fades at top/bottom so
 *  overflow is visually hinted without adding DOM. Browsers force
 *  `overflow-x: hidden` when `-y` is `auto`; that's acceptable here because
 *  rows inside are width-bounded. */
export function ScrollArea({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const mask =
    'linear-gradient(to bottom, transparent 0, black 14px, black calc(100% - 14px), transparent 100%)';
  return (
    <div
      className={`overflow-y-auto ${className ?? ''}`}
      style={{ WebkitMaskImage: mask, maskImage: mask }}
    >
      {children}
    </div>
  );
}

// ---------- Button ----------

type ButtonVariant = 'primary' | 'ghost' | 'iconGhost';

export function Button({
  variant = 'primary',
  disabled,
  onClick,
  children,
  title,
  ariaLabel,
  className,
}: {
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  title?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const base =
    'rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const styles: Record<ButtonVariant, string> = {
    primary:
      'bg-accent hover:bg-accent/90 text-ink font-semibold px-3 py-1.5 text-xs',
    ghost:
      'border border-border text-text-dim hover:bg-elevated px-3 py-1.5 text-xs',
    iconGhost:
      'text-text-faint hover:text-err opacity-50 hover:opacity-100 text-sm leading-none px-1',
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className={`${base} ${styles[variant]} ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

// ---------- Input ----------

export function Input({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onSubmit) onSubmit();
      }}
      className={`flex-1 min-w-0 rounded-sm bg-ink/60 border border-border px-3 py-1.5 text-xs font-mono text-text placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors ${className ?? ''}`}
      placeholder={placeholder}
      spellCheck={false}
    />
  );
}

// ---------- KeyValueRow ----------

/** Inline when the combined length fits on one line; otherwise stack key
 *  above value so long values (big integers, JSON blobs, URLs) don't
 *  overflow or crowd the key label. Caller passes `altIndex` to drive
 *  subtle stripe alternation. */
export function KeyValueRow({
  keyText,
  value,
  altIndex,
  inlineThreshold = 34,
}: {
  keyText: string;
  value: string;
  altIndex?: number;
  inlineThreshold?: number;
}) {
  const inline = keyText.length + value.length <= inlineThreshold && !value.includes('\n');
  const stripe = altIndex !== undefined && altIndex % 2 === 1 ? 'bg-white/[0.025]' : '';
  const base = `rounded-sm px-2 py-1 min-w-0 ${stripe}`;
  if (inline) {
    return (
      <div className={`${base} flex items-baseline gap-3`}>
        <dt className="text-text-faint text-[11px] shrink-0 truncate max-w-[40%]">{keyText}</dt>
        <dd className="text-text text-xs font-mono flex-1 min-w-0 text-right truncate">{value}</dd>
      </div>
    );
  }
  return (
    <div className={base}>
      <dt className="text-text-faint text-[10px] uppercase tracking-wider truncate">{keyText}</dt>
      <dd className="text-text text-xs font-mono break-all mt-0.5">{value}</dd>
    </div>
  );
}

// ---------- ErrorBox ----------

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-sm border border-err/40 bg-err/10 p-2.5 text-xs font-mono text-err">
      {children}
    </div>
  );
}

// ---------- Chip (generic pill row, used by filters + anywhere else) ----------

export function Chip({
  tone = 'active',
  children,
  right,
}: {
  tone?: 'active' | 'muted';
  children: ReactNode;
  right?: ReactNode;
}) {
  const dot = tone === 'active' ? 'bg-ok' : 'bg-border-strong';
  return (
    <li className="group flex items-center gap-2 rounded-sm bg-ink/60 border border-border px-2.5 py-1.5">
      <span className={`size-1.5 rounded-full ${dot}`} />
      <code className="flex-1 min-w-0 truncate text-xs font-mono text-text">{children}</code>
      {right}
    </li>
  );
}
