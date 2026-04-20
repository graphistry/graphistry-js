// UI primitives for the client-api-context example.
//
// Tokens live in index.css (@theme). Keep this file component-only — no
// business logic, no data fetching — so composition in App.tsx reads as
// "panels + rows filled with data from hooks".

import { useEffect, useRef, useState, type ReactNode } from 'react';

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

// ---------- Drawer + Hamburger ----------

/** 14px line-group hamburger glyph. Parent controls color via
 *  `text-text-{dim,faint}`; the button variant sets hover. */
export function HamburgerGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <path
        d="M2 4 H14 M2 8 H14 M2 12 H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Minimal icon button, no background — used for the hamburger. Keeps the
 *  viz canvas visually unbroken at rest. */
export function IconButton({
  onClick,
  ariaLabel,
  children,
  className,
}: {
  onClick?: () => void;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`p-1.5 rounded-sm text-text-faint hover:text-text hover:bg-elevated/60 transition-colors ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

/** Left-slide drawer. Caller owns `open`/`onClose` (so the trigger can live
 *  anywhere). Renders a backdrop with click-to-close and an escape-key
 *  listener; body scrolls independently. */
export function Drawer({
  open,
  onClose,
  title,
  width = 320,
  toolbar,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  /** Sticky content below the title and above the scroll area. Use for
   *  always-visible actions (eg the Arrange button) that shouldn't scroll
   *  out of view with the panel list. */
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // No backdrop — the viz stays fully interactive while the drawer is open.
  // The drawer's own surface catches clicks; outside clicks pass through to
  // the canvas. Close via the × button or Esc.
  return (
    <>
      <aside
        role="dialog"
        aria-hidden={!open}
        className={`absolute top-0 bottom-0 left-0 z-30 flex flex-col bg-surface/95 backdrop-blur-md border-r border-border shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-transform duration-200 ease-out ${
          open ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
        }`}
        style={{ width }}
      >
        {title !== undefined && (
          <header className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
            <h2 className="text-[11px] uppercase tracking-[0.14em] text-text-faint font-medium">
              {title}
            </h2>
            <IconButton ariaLabel="Close drawer" onClick={onClose}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path
                  d="M3 3 L9 9 M9 3 L3 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </header>
        )}
        {toolbar !== undefined && (
          <div className="shrink-0 border-b border-border">{toolbar}</div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </>
  );
}

// ---------- Panel primitives (rows, sections) ----------

/** Section separator inside a Drawer or Panel. All-caps micro-label; sits
 *  tight to the row below. */
export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-text-faint">
      {children}
    </div>
  );
}

/** One labelled control row. Label sits left (flex-1 by default so short
 *  toggles/swatches end-align cleanly); control area sits right. For sliders
 *  pass `wideLabel={false}` so the slider takes most of the row. */
export function PanelRow({
  label,
  labelFill = false,
  children,
}: {
  label: string;
  labelFill?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border/40 last:border-b-0">
      <span
        className={`text-[11px] text-text-dim ${
          labelFill ? 'flex-1 min-w-0 truncate' : 'w-20 shrink-0 truncate'
        }`}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0 flex items-center justify-end">{children}</div>
    </div>
  );
}

// ---------- Toggle ----------

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`relative shrink-0 w-8 h-[18px] rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-accent' : 'bg-elevated'
      }`}
    >
      <span
        className={`absolute top-[2px] size-[14px] rounded-full transition-[left] duration-150 ${
          checked ? 'bg-ink left-4' : 'bg-text-faint left-[2px]'
        }`}
      />
    </button>
  );
}

// ---------- Slider ----------

/** Range input styled to the theme. Native element for accessibility; the
 *  track + thumb are painted with inline gradients so no global CSS is
 *  required. Shows numeric value on the right. */
export function Slider({
  value,
  min = 0,
  max = 1,
  step,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (v: number) => void;
}) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const fmt = Number.isInteger(value) ? String(value) : value.toFixed(2);
  const trackBg = `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${pct}%, var(--color-elevated) ${pct}%, var(--color-elevated) 100%)`;
  return (
    <div className="flex-1 flex items-center gap-2 min-w-0">
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? (max - min) / 100}
        value={value}
        onChange={(e) => onChange?.(+e.target.value)}
        className="ui-slider flex-1 min-w-0 h-1 appearance-none rounded-sm cursor-pointer accent-accent"
        style={{ background: trackBg }}
      />
      <span className="text-[10px] font-mono text-text-faint w-10 text-right shrink-0 tabular-nums">
        {fmt}
      </span>
    </div>
  );
}

// ---------- Select ----------

export function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label?: string }>;
  onChange?: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="flex-1 rounded-sm bg-elevated border border-border px-2 py-1 text-[11px] text-text focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-surface text-text">
          {o.label ?? o.value}
        </option>
      ))}
    </select>
  );
}

// ---------- ColorSwatch ----------

/** Square color swatch that opens a native color picker on click, with a
 *  hex input alongside. Prototype-simple — no HSV wheel. */
export function ColorSwatch({
  value,
  onChange,
}: {
  value: string;
  onChange?: (v: string) => void;
}) {
  const [hex, setHex] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  // Re-sync when external value changes (e.g. initial load from viz state).
  useEffect(() => setHex(value), [value]);
  const commit = (v: string) => {
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange?.(v);
  };
  return (
    <div className="flex items-center gap-2 shrink-0">
      <input
        ref={inputRef}
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#000000'}
        onChange={(e) => {
          setHex(e.target.value);
          onChange?.(e.target.value);
        }}
        className="size-5 rounded-sm border border-border cursor-pointer bg-transparent appearance-none overflow-hidden"
        aria-label="Pick color"
      />
      <input
        value={hex}
        onChange={(e) => setHex(e.target.value)}
        onBlur={() => commit(hex)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit(hex);
        }}
        spellCheck={false}
        className="w-20 rounded-sm bg-ink/60 border border-border px-2 py-1 text-[10px] font-mono text-text placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
