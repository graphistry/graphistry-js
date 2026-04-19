// Correlation-id RPC client over the Protocol v2 envelope.
//
// The iframe side is a generic dispatcher over the three falcor primitives
// (call / get / set) — see graphistry apps/core/viz/src/client/falcor/LocalDataSink.js.
// This file is the host-side counterpart: mint an id, post the request,
// resolve/reject the Promise when the correlation-matched response arrives.
//
// No rxjs dependency. Returns plain Promises so consumers can await naturally
// without understanding falcor or rxjs.

let nextSeq = 0;
const mintId = () => `rpc-${Date.now().toString(36)}-${(nextSeq++).toString(36)}`;

/**
 * Typed error for Protocol v2 RPC failures.
 * Properties:
 *   - kind: 'invalid_op' | 'internal' | 'timeout' | 'disposed' | string
 *   - op:   the op name at the time of failure ('call' | 'get' | 'set' | 'unknown')
 *   - message: human-readable message
 * Subclass discriminated by `kind` so callers can `if (err.kind === 'timeout')`.
 */
export class GraphistryRpcError extends Error {
    constructor({ kind, op, message, ...rest } = {}) {
        super(message || `Graphistry RPC error (${kind ?? 'unknown'})`);
        this.name = 'GraphistryRpcError';
        this.kind = kind;
        this.op = op;
        Object.assign(this, rest);
    }
}

/**
 * Create a Protocol v2 RPC client bound to a specific iframe.
 *
 * @param {HTMLIFrameElement} iframe — the <iframe> hosting the Graphistry viz.
 * @param {object} [options]
 * @param {number} [options.timeoutMs=30000] — reject after this many ms with kind 'timeout'.
 * @param {Window} [options.window=globalThis.window] — for tests.
 * @returns {{ call, get, set, dispose }}
 *   - call(path, args?) → Promise<result>       (model.call(path, args))
 *   - get(...paths)     → Promise<jsonGraph>    (model.get(...paths))
 *   - set(json)         → Promise<jsonGraph>    (model.set(json))
 *   - dispose()         → void — detaches the message listener and rejects all pending calls.
 */
export function createRpcClient(iframe, { timeoutMs = 30000, window: win = globalThis.window } = {}) {
    if (!iframe) throw new Error('createRpcClient: iframe is required');
    if (!win) throw new Error('createRpcClient: no window available');

    const pending = new Map(); // id → { resolve, reject, timer, op }
    let disposed = false;

    const onMessage = ({ data, source }) => {
        if (!data || data.agent !== 'graphistryjs' || data.type !== 'graphistry-rpc-response') return;
        // Filter to messages originating from our iframe (guards against
        // cross-frame noise in multi-iframe pages).
        if (iframe.contentWindow && source !== iframe.contentWindow) return;
        const entry = pending.get(data.id);
        if (!entry) return;
        clearTimeout(entry.timer);
        pending.delete(data.id);
        if (data.error) {
            entry.reject(new GraphistryRpcError(data.error));
        } else {
            entry.resolve(data.result);
        }
    };
    win.addEventListener('message', onMessage);

    const send = (envelope) => {
        if (disposed) {
            return Promise.reject(new GraphistryRpcError({
                kind: 'disposed', op: envelope.op,
                message: 'RPC client has been disposed.',
            }));
        }
        const target = iframe.contentWindow;
        if (!target) {
            return Promise.reject(new GraphistryRpcError({
                kind: 'internal', op: envelope.op,
                message: 'iframe has no contentWindow yet; wait for it to mount before making RPC calls.',
            }));
        }
        const id = mintId();
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                pending.delete(id);
                reject(new GraphistryRpcError({
                    kind: 'timeout', op: envelope.op,
                    message: `RPC ${envelope.op} timed out after ${timeoutMs}ms.`,
                }));
            }, timeoutMs);
            pending.set(id, { resolve, reject, timer, op: envelope.op });
            target.postMessage(
                { type: 'graphistry-rpc-request', agent: 'graphistryjs', id, ...envelope },
                '*'
            );
        });
    };

    return {
        call: (path, args = []) => send({ op: 'call', path, args }),
        get:  (...paths) => send({ op: 'get', paths }),
        set:  (json) => send({ op: 'set', json }),
        dispose: () => {
            if (disposed) return;
            disposed = true;
            win.removeEventListener('message', onMessage);
            for (const [, entry] of pending) {
                clearTimeout(entry.timer);
                entry.reject(new GraphistryRpcError({
                    kind: 'disposed', op: entry.op,
                    message: 'RPC client disposed before response arrived.',
                }));
            }
            pending.clear();
        },
    };
}
