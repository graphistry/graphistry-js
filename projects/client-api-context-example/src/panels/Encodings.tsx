// Attribute-driven encoding builder for point color, point size, and edge
// color. All wire-protocol concerns (ref-walking, ghost-entry filtering,
// attribute prefix stripping, palette-colors spread, atom-wrapping) live
// inside `@graphistry/client-api-context` — this panel just wires the hooks
// into the three row layouts.

import { useMemo, useState } from 'react';
import {
  useGraphistry,
  useColumns,
  usePalettes,
  useEncoding,
  columnsForEncoding,
  GraphistryRpcError,
} from '@graphistry/client-api-context';
import type {
  ColumnMeta,
  Palette,
  EncodingKind,
} from '@graphistry/client-api-context';
import { Button, SectionHeader, Select } from '../ui';
import { ChevronGlyph, PaletteSelect, PaletteSwatch } from '../components/PaletteSelect';

/** Strip the `componentType:` prefix from an attribute for display. The
 *  bridge takes the bare name across the wire, but ColumnMeta.attribute
 *  keeps the prefix so callers can distinguish point vs edge variants of
 *  the same column name. */
function bareAttr(attr: string): string {
  return attr.replace(/^(point|edge):/, '');
}

interface AppliedState {
  attribute: string;
  paletteLabel?: string;
  paletteColors?: string[];
}

/** One encoding row: compact summary + chevron, click to reveal the editor
 *  in-place (attribute select, palette select, swatch preview, apply/reset).
 *  Local UI state only — `useEncoding(kind)` owns the imperative write. */
function EncodingRow({
  kind,
  columns,
  palettes,
}: {
  kind: EncodingKind;
  columns: ColumnMeta[];
  palettes: Palette[];
}) {
  const { ready } = useGraphistry();
  const encoding = useEncoding(kind);
  const meta = encoding.meta;
  const [expanded, setExpanded] = useState(false);
  const [attribute, setAttribute] = useState('');
  const [paletteName, setPaletteName] = useState('');
  const [applied, setApplied] = useState<AppliedState | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const availableColumns = useMemo(
    () => columnsForEncoding(columns, kind),
    [columns, kind]
  );
  const selectedPalette = palettes.find((p) => p.name === paletteName);

  const run = async (fn: () => Promise<unknown>, okMsg: string, onOk?: () => void) => {
    setStatus(null);
    try {
      await fn();
      setStatus(okMsg);
      onOk?.();
    } catch (err) {
      if (err instanceof GraphistryRpcError && (err as { kind?: string }).kind === 'disposed') return;
      setStatus(`⚠ ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const apply = () => {
    if (!attribute) return;
    run(
      () => encoding.apply({ attribute, palette: selectedPalette }),
      'Applied',
      () =>
        setApplied({
          attribute,
          paletteLabel: selectedPalette?.label ?? selectedPalette?.name,
          paletteColors: selectedPalette?.colors,
        })
    );
  };

  const reset = () => {
    run(() => encoding.reset(), 'Cleared', () => setApplied(null));
  };

  const busy = encoding.writing;
  const applyDisabled = busy || !ready || !attribute || (meta.needsPalette && !paletteName);
  const summaryText = applied
    ? meta.needsPalette && applied.paletteLabel
      ? `${bareAttr(applied.attribute)} · ${applied.paletteLabel}`
      : bareAttr(applied.attribute)
    : '—';

  return (
    <div className="border-b border-border/40 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors cursor-pointer ${
          expanded ? 'bg-hover/50' : 'hover:bg-hover/40'
        }`}
      >
        {/* Three-column summary: fixed title | fixed summary (dash aligns
            across rows) | right-aligned swatch + chevron. When expanded,
            brighten the title so it reads as a section header relative to
            the editor's inner `Attribute` / `Palette` field labels. */}
        <span
          className={`text-[11px] w-24 shrink-0 truncate ${
            expanded ? 'text-text font-medium' : 'text-text-dim'
          }`}
        >
          {meta.title}
        </span>
        <span
          className={`text-[11px] font-mono truncate flex-1 min-w-0 ${
            applied ? 'text-text' : 'text-text-faint'
          }`}
        >
          {summaryText}
        </span>
        {applied?.paletteColors && applied.paletteColors.length > 0 && (
          <PaletteSwatch colors={applied.paletteColors} width="48px" />
        )}
        <ChevronGlyph open={expanded} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-2 space-y-3 bg-ink/30">
          {/* Stack label above control so long attribute / palette names
              don't overflow a label column. `<label>` needs `block`
              because Tailwind's `space-y-*` only stacks block children.
              Native <select> needs a flex wrapper for `flex-1` to expand. */}
          <div className="space-y-1">
            <label className="block text-[10px] text-text-faint">Attribute</label>
            <div className="flex">
              <Select
                value={attribute}
                options={[
                  { value: '', label: availableColumns.length === 0 ? '— none —' : '— pick —' },
                  ...availableColumns.map((c) => ({
                    value: c.attribute,
                    label: `${c.name} (${c.dataType})`,
                  })),
                ]}
                onChange={setAttribute}
              />
            </div>
          </div>
          {meta.needsPalette && (
            <div className="space-y-1">
              <label className="block text-[10px] text-text-faint">Palette</label>
              <PaletteSelect
                value={paletteName}
                palettes={palettes}
                onChange={setPaletteName}
                placeholder={palettes.length === 0 ? '— none —' : '— pick —'}
              />
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            {status && (
              <span className="text-[10px] font-mono text-text-faint self-center truncate mr-auto">
                {status}
              </span>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {applied && (
                <Button variant="ghost" disabled={busy || !ready} onClick={reset}>
                  Reset
                </Button>
              )}
              <Button variant="primary" disabled={applyDisabled} onClick={apply}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function EncodingsPanel() {
  const { columns } = useColumns();
  const { palettes: pointPalettes } = usePalettes('point');
  const { palettes: edgePalettes } = usePalettes('edge');

  return (
    <>
      <SectionHeader>Encodings</SectionHeader>
      <EncodingRow kind="point-color" columns={columns} palettes={pointPalettes} />
      <EncodingRow kind="point-size" columns={columns} palettes={[]} />
      <EncodingRow kind="edge-color" columns={columns} palettes={edgePalettes} />
    </>
  );
}
