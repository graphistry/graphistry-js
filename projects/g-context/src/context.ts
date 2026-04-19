/**
 * Graphistry React context — skeleton stubs only.
 *
 * Implementation lands in a follow-up. See
 * graphistry/ai_code_notes/architecture/external_bridge.md for design.
 */

import type { ReactNode } from 'react';

export interface GraphistryScene {
  readonly id: string;
}

export interface GraphistryProviderProps {
  children?: ReactNode;
}

export function GraphistryProvider(_props: GraphistryProviderProps): never {
  throw new Error('not implemented');
}

export function useGraphistry(): never {
  throw new Error('not implemented');
}

export function useGraphistryScene(): GraphistryScene {
  throw new Error('not implemented');
}
