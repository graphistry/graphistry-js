/*
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const version = JSON.parse(
    <string> <unknown> readFileSync(join(dirname(require.resolve("@graphistry/node-api")), "package.json"))
).version;
*/

import path from 'path';
import {fileURLToPath} from 'url';
import {readFileSync} from 'fs';

let resolvedVersion;
try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const packagePath = path.join(__dirname, 'package.json');
    const packageFile = readFileSync(packagePath, 'utf8');
    const packageJSON = JSON.parse(packageFile);
    resolvedVersion = packageJSON.version;
} catch (e) {
    console.warn('Could not resolve version from package.json', e);
    resolvedVersion = 'unknown';
}

/**
 * The version of @graphistry/node-api.
 * 
 * If the version is not available, it will be `unknown`.
 */
export const version = resolvedVersion;