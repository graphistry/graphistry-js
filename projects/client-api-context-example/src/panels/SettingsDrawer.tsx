// Left-slide settings drawer — hamburger trigger, sticky Arrange toolbar,
// and the three stacked settings panels. Owns its own open/close state
// (persisted across HMR so iterating on any panel doesn't lose the open
// drawer every reload).

import { useEffect, useState } from 'react';
import { Drawer, HamburgerGlyph, IconButton } from '../ui';
import { ArrangeButton } from './Arrange';
import { LayoutPanel } from './Layout';
import { EncodingsPanel } from './Encodings';
import { AppearancePanel } from './Appearance';
import { SCENE_BG_HEX } from '../config';

const STORAGE_KEY = 'drawerOpen';

function usePersistedBool(key: string, initial: boolean): [boolean, (v: boolean) => void] {
  const [v, setV] = useState(() => {
    if (typeof window === 'undefined') return initial;
    return window.localStorage.getItem(key) === '1';
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, v ? '1' : '0');
    }
  }, [key, v]);
  return [v, setV];
}

export function SettingsDrawer() {
  const [open, setOpen] = usePersistedBool(STORAGE_KEY, false);

  return (
    <>
      <div className="absolute top-3 left-3 z-10">
        <IconButton ariaLabel="Open settings drawer" onClick={() => setOpen(true)}>
          <HamburgerGlyph />
        </IconButton>
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Settings"
        toolbar={<ArrangeButton />}
      >
        <LayoutPanel />
        <EncodingsPanel />
        <AppearancePanel initialBg={SCENE_BG_HEX} />
      </Drawer>
    </>
  );
}
