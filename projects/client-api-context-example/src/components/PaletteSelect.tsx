// Popover dropdown over a list of Graphistry color palettes. The trigger
// shows the selected palette's swatch + label; the menu renders each option
// with an inline swatch preview — something the native <select> can't do.
// Closes on outside click or Escape.

import { useEffect, useRef, useState } from 'react';
import type { Palette } from '@graphistry/client-api-context';

/** A thin coloured band used as a palette preview. Width defaults to 100%;
 *  pass a fixed CSS width (e.g. `"40px"`) in compact layouts. */
export function PaletteSwatch({
  colors,
  width,
}: {
  colors: string[];
  width?: string;
}) {
  return (
    <div
      className="flex h-3 rounded-sm overflow-hidden border border-border shrink-0"
      style={{ width: width ?? '100%' }}
    >
      {colors.map((c, i) => (
        <div key={i} className="flex-1" style={{ backgroundColor: c }} />
      ))}
    </div>
  );
}

/** Small disclosure caret that flips on `open`. Used by the PaletteSelect
 *  trigger, and by panel rows that mirror the same affordance. */
export function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 10 10"
      className={`shrink-0 text-text-faint transition-transform ${open ? 'rotate-180' : ''}`}
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
  );
}

export function PaletteSelect({
  value,
  palettes,
  onChange,
  placeholder,
}: {
  value: string;
  palettes: Palette[];
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = palettes.find((p) => p.name === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const swatchOrPlaceholder = (p: Palette | undefined) =>
    p?.colors && p.colors.length > 0 ? (
      <PaletteSwatch colors={p.colors} width="40px" />
    ) : (
      <span className="h-3 w-[40px] rounded-sm border border-border shrink-0 bg-ink/40" />
    );

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 rounded-sm bg-elevated border border-border px-2 py-1 text-[11px] text-text hover:bg-hover focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
      >
        {swatchOrPlaceholder(current)}
        <span className={`flex-1 truncate text-left ${current ? 'text-text' : 'text-text-faint'}`}>
          {current ? current.label ?? current.name : placeholder}
        </span>
        <ChevronGlyph open={open} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-64 overflow-y-auto rounded-sm border border-border bg-surface shadow-lg">
          {palettes.length === 0 ? (
            <div className="px-2 py-1.5 text-[11px] text-text-faint">— none —</div>
          ) : (
            palettes.map((p) => {
              const selected = p.name === value;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    onChange(p.name);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1 text-[11px] text-left cursor-pointer ${
                    selected ? 'bg-accent/15 text-accent' : 'text-text hover:bg-hover'
                  }`}
                >
                  {swatchOrPlaceholder(p)}
                  <span className="flex-1 truncate">{p.label ?? p.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
