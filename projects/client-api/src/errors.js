// Typed error classes for the Protocol v2 surface beyond RPC.
// GraphistryRpcError lives in rpc.js (it's emitted by the RPC client
// itself). GraphistryPermissionError is emitted by the subscribe channel
// when a path is gated by a server-side feature flag.

/** Thrown/returned when a subscribe path is gated by a server-side feature flag. */
export class GraphistryPermissionError extends Error {
    /** @param {{path: string, flag?: string, message?: string}} opts */
    constructor({ path, flag, message } = {}) {
        super(
            message || (flag
                ? `Subscription to "${path}" requires the ${flag} feature flag on the Graphistry server. ` +
                  `Ask your admin to enable it, or drop the subscription to this path.`
                : `Subscription to "${path}" is not permitted on this server.`)
        );
        this.name = 'GraphistryPermissionError';
        this.path = path;
        this.flag = flag;
    }
}
