/**
 * ExternalStore — skeleton stub.
 *
 * Implementation lands in a follow-up. See
 * graphistry/ai_code_notes/architecture/external_bridge.md for design.
 */

export type Listener = () => void;
export type Unsubscribe = () => void;

export class ExternalStore<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_initial: T) {
    throw new Error('not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribe(_listener: Listener): Unsubscribe {
    throw new Error('not implemented');
  }

  getSnapshot(): T {
    throw new Error('not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_updater: (prev: T) => T): void {
    throw new Error('not implemented');
  }
}
