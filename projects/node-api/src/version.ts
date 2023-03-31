/*
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const version = JSON.parse(
    <string> <unknown> readFileSync(join(dirname(require.resolve("@graphistry/node-api")), "package.json"))
).version;
*/

let resolvedVersion;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    resolvedVersion = require(`@graphistry/node-api/package.json`).version ?? 'unknown';
} catch (e) {
    resolvedVersion = 'unknown';
}

/**
 * The version of @graphistry/node-api.
 * 
 * If the version is not available, it will be `unknown`.
 */
export const version = resolvedVersion;