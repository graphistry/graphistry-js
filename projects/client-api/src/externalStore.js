// Framework-agnostic external store with shallow equality + refcount hooks.
//
// Tearing is prevented because getSnapshot returns the same reference when
// nothing changed — update() shallow-compares and keeps the previous
// snapshot when equal. subscribe is stable across renders because we bind
// it in the constructor, which useSyncExternalStore relies on.
//
// No React dependency. Consumers (React, Vue, Svelte, vanilla) adapt.

/**
 * @template T
 * @typedef {Object} ExternalStoreOptions
 * @property {T} initial
 * @property {ReadonlyArray<keyof T>} [arrayKeys] — keys whose array values should compare element-wise instead of by identity.
 * @property {() => void} [onFirstListener] — fires when listener count goes 0 → 1.
 * @property {() => void} [onLastListener] — fires when listener count goes 1 → 0.
 */

function arrEq(a, b) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

function shapeEq(a, b, arrayKeys) {
    if (a === b) return true;
    if (!a || !b) return false;
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    for (const k of keys) {
        if (arrayKeys.indexOf(k) >= 0) {
            const av = a[k];
            const bv = b[k];
            if (Array.isArray(av) && Array.isArray(bv)) {
                if (!arrEq(av, bv)) return false;
            } else if (av !== bv) {
                return false;
            }
        } else if (a[k] !== b[k]) {
            return false;
        }
    }
    return true;
}

/** @template T */
export class ExternalStore {
    /** @param {ExternalStoreOptions<T>} options */
    constructor(options) {
        this._snapshot = options.initial;
        this._listeners = new Set();
        this._arrayKeys = options.arrayKeys || [];
        this._onFirst = options.onFirstListener || (() => {});
        this._onLast = options.onLastListener || (() => {});
        // Bind once — useSyncExternalStore requires subscribe to be referentially stable.
        this.subscribe = this.subscribe.bind(this);
        this.getSnapshot = this.getSnapshot.bind(this);
    }

    /** @param {() => void} listener @returns {() => void} unsubscribe */
    subscribe(listener) {
        this._listeners.add(listener);
        if (this._listeners.size === 1) this._onFirst();
        return () => {
            this._listeners.delete(listener);
            if (this._listeners.size === 0) this._onLast();
        };
    }

    /** @returns {T} */
    getSnapshot() {
        return this._snapshot;
    }

    /** Replace the snapshot if the incoming one differs under the configured equality.
     *  @param {T} incoming */
    update(incoming) {
        if (shapeEq(this._snapshot, incoming, this._arrayKeys)) return;
        this._snapshot = incoming;
        for (const l of this._listeners) l();
    }

    /** Merge an error field without touching other fields. Assumes T has `error` key.
     *  @param {unknown} error */
    setError(error) {
        this.update({ ...this._snapshot, error });
    }
}
