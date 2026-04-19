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
        this._attached = false;
        this._onMessage = this._onMessage.bind(this);
    }

    /**
     * Register a subscribe path with its store + projection.
     * Call before any acquire() so updates routed for this path land correctly.
     * @param {string} path
     * @param {{update: (v: any) => void, setError: (e: unknown) => void}} store
     * @param {(raw: unknown) => any} project
     */
    register(path, store, project) {
        this._paths.set(path, { store, project });
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
        // Resubscribe anything acquired while the iframe was detached.
        for (const path of this._counts.keys()) this._sendSubscribe(path);
    }

    detachIframe() {
        if (this._attached) {
            window.removeEventListener('message', this._onMessage);
            this._attached = false;
        }
        this.iframe = null;
    }

    _sendSubscribe(path) {
        if (!this.iframe || !this.iframe.contentWindow) return;
        this.iframe.contentWindow.postMessage(
            { type: 'graphistry-subscribe', agent: 'graphistryjs', path },
            '*'
        );
    }

    _sendUnsubscribe(path) {
        if (!this.iframe || !this.iframe.contentWindow) return;
        this.iframe.contentWindow.postMessage(
            { type: 'graphistry-unsubscribe', agent: 'graphistryjs', path },
            '*'
        );
    }

    _onMessage(event) {
        const data = event.data;
        if (!data || data.agent !== 'graphistryjs') return;
        if (this.iframe && this.iframe.contentWindow && event.source !== this.iframe.contentWindow) return;

        if (data.type === 'graphistry-sub-update') {
            const reg = this._paths.get(data.path);
            if (!reg) return;
            try {
                reg.store.update(reg.project(data.data));
            } catch (err) {
                console.error('[client-api] projection failed for', data.path, err);
            }
        } else if (data.type === 'graphistry-sub-error') {
            const reg = this._paths.get(data.path);
            if (!reg) return;
            reg.store.setError(new GraphistryPermissionError({
                path: data.path,
                flag: data.error && data.error.flag,
                message: data.error && data.error.message,
            }));
        }
    }
}
