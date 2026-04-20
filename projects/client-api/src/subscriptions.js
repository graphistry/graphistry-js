// Subscription manager — wires iframe postMessage ↔ ExternalStore instances.
//
// Each registered path maps to one store + one projection fn. The manager
// refcounts listeners (first listener → graphistry-subscribe; last
// listener removed → graphistry-unsubscribe). graphistry-sub-error
// decorates the store with a typed GraphistryPermissionError.
//
// Framework-agnostic. React adaptation lives in @graphistry/client-api-context.

import { GraphistryPermissionError } from './errors';

export class SubscriptionManager {
    constructor() {
        /** @type {HTMLIFrameElement | null} */
        this.iframe = null;
        /** @type {Map<string, {store: any, project: (raw: unknown) => any}>} */
        this._paths = new Map();
        /** @type {Map<string, number>} */
        this._counts = new Map();
        // Per-path JSON of the last accepted sub-update payload. The iframe
        // debounces at 50ms but each push carries fresh object identities, so
        // hover/animation can fire many pushes that contain identical data.
        // We dedupe at the boundary so the React tree doesn't re-render.
        /** @type {Map<string, string>} */
        this._lastSerialized = new Map();
        this._attached = false;
        // True once the iframe has reported `init` for the current attachment.
        // Subscribes posted before this are dropped by the iframe (its own
        // message listener doesn't exist until LocalDataSink is constructed),
        // so we re-issue them on the first init we observe.
        this._iframeReady = false;
        this._onMessage = this._onMessage.bind(this);
    }

    /**
     * Register a subscribe path with its store + projection.
     * Call before any acquire() so updates routed for this path land correctly.
     * @param {string} path — client-chosen identifier, echoed back in sub-updates.
     * @param {{update: (v: any) => void, setError: (e: unknown) => void}} store
     * @param {(raw: unknown) => any} project
     * @param {Array<Array<*>>} [pathSets] — falcor pathSets for v2 generic subscribe.
     *   If omitted, the iframe treats `path` as a v1 hand-enriched path
     *   (only .labels and .selection.labels are valid).
     * @param {Record<string, unknown>} [options] — passed through to the iframe
     *   in the subscribe message. v1 paths read these via `pathOptions[path]`
     *   to vary the fragment shape (e.g. `{withColumns: true}` for selection).
     */
    register(path, store, project, pathSets, options) {
        this._paths.set(path, { store, project, pathSets, options });
    }

    /** Called by an ExternalStore when its listener count goes 0 → 1. */
    acquire(path) {
        const next = (this._counts.get(path) || 0) + 1;
        this._counts.set(path, next);
        if (next === 1) this._sendSubscribe(path);
    }

    /** Called by an ExternalStore when its listener count goes 1 → 0. */
    release(path) {
        const next = (this._counts.get(path) || 1) - 1;
        if (next <= 0) {
            this._counts.delete(path);
            this._sendUnsubscribe(path);
        } else {
            this._counts.set(path, next);
        }
    }

    attachIframe(iframe) {
        if (this.iframe === iframe && this._attached) return;
        this.detachIframe();
        this.iframe = iframe;
        window.addEventListener('message', this._onMessage);
        this._attached = true;
        this._iframeReady = false;
        console.debug('[subs] iframe attached; registered paths:', Array.from(this._paths.keys()), 'live counts:', Object.fromEntries(this._counts));
        // Optimistic first send. The iframe likely hasn't loaded yet, so the
        // message is usually dropped — but if attach races AFTER load (HMR /
        // re-attach to a warm iframe), this delivers without waiting for init.
        for (const path of this._counts.keys()) this._sendSubscribe(path);
    }

    detachIframe() {
        if (this._attached) {
            window.removeEventListener('message', this._onMessage);
            this._attached = false;
        }
        this.iframe = null;
        this._iframeReady = false;
        // Stale on the next iframe — different model instance, possibly
        // different schema. Force the next push through.
        this._lastSerialized.clear();
    }

    _sendSubscribe(path) {
        if (!this.iframe || !this.iframe.contentWindow) {
            console.debug('[subs] _sendSubscribe deferred (no iframe yet):', path);
            return;
        }
        const reg = this._paths.get(path);
        const msg = { type: 'graphistry-subscribe', agent: 'graphistryjs', path };
        if (reg && reg.pathSets) msg.pathSets = reg.pathSets;
        if (reg && reg.options) msg.options = reg.options;
        console.debug('[subs] →iframe graphistry-subscribe:', path, msg.pathSets ? '(v2 pathSets)' : '(v1)', msg.options || '');
        this.iframe.contentWindow.postMessage(msg, '*');
    }

    _sendUnsubscribe(path) {
        if (!this.iframe || !this.iframe.contentWindow) return;
        console.debug('[subs] →iframe graphistry-unsubscribe:', path);
        this.iframe.contentWindow.postMessage(
            { type: 'graphistry-unsubscribe', agent: 'graphistryjs', path },
            '*'
        );
    }

    /** Force re-emit of one path's current state. Useful right after RPC
     *  mutations (filter add / reset / setSelection) when the iframe-side
     *  push pipeline doesn't observe the change automatically. The iframe
     *  treats this as a new subscriber and re-runs the initial fetch. */
    refresh(path) {
        if (!this._counts.has(path)) return;
        // Drop the dedupe cache so the next push is allowed through even if
        // it serializes identically to the last accepted snapshot.
        this._lastSerialized.delete(path);
        // Cycle subscribe to force LocalDataSink._startGenericSubscribe / v1 re-push.
        this._sendUnsubscribe(path);
        this._sendSubscribe(path);
    }

    _onMessage(event) {
        const data = event.data;
        if (!data || data.agent !== 'graphistryjs') return;
        if (this.iframe && this.iframe.contentWindow && event.source !== this.iframe.contentWindow) return;

        // Relay iframe diagnostic logs into the host console. vite-plugin-
        // console-forward only forwards the PARENT window's console, so
        // without this the iframe's console.log output is invisible to the
        // agent that owns the Vite terminal.
        if (data.type === 'graphistry-iframe-log') {
            console.log(`[iframe ${data.tag}]`, ...(data.args ?? []));
            return;
        }

        // Iframe just came online for this attachment — early subscribes posted
        // before LocalDataSink was constructed got dropped. Re-issue them once.
        if (data.type === 'init' && !this._iframeReady) {
            this._iframeReady = true;
            console.debug('[subs] iframe init observed; replaying', this._counts.size, 'subscribes');
            for (const path of this._counts.keys()) this._sendSubscribe(path);
            return;
        }

        if (data.type === 'graphistry-sub-update') {
            const reg = this._paths.get(data.path);
            if (!reg) {
                console.debug('[subs] ←iframe sub-update for unregistered path:', data.path);
                return;
            }
            // Cheap pre-projection dedupe — iframe re-pushes identical payloads
            // during hover/animation, and serialization here is much cheaper
            // than re-rendering the React subtree it would otherwise trigger.
            let serialized;
            try { serialized = JSON.stringify(data.data); } catch { serialized = undefined; }
            if (serialized !== undefined && this._lastSerialized.get(data.path) === serialized) return;
            if (serialized !== undefined) this._lastSerialized.set(data.path, serialized);
            const preview = serialized === undefined
                ? '(unserializable)'
                : serialized.length > 160
                    ? serialized.slice(0, 160) + `…(+${serialized.length - 160})`
                    : serialized;
            console.debug('[subs] ←sub-update', data.path, preview);
            try {
                reg.store.update(reg.project(data.data));
            } catch (err) {
                console.error('[subs] projection failed for', data.path, err);
            }
        } else if (data.type === 'graphistry-sub-error') {
            const reg = this._paths.get(data.path);
            if (!reg) return;
            console.debug('[subs] ←iframe sub-error:', data.path, data.error);
            reg.store.setError(new GraphistryPermissionError({
                path: data.path,
                flag: data.error && data.error.flag,
                message: data.error && data.error.message,
            }));
        }
    }
}
