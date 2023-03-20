import { Client as ClientBase, Dataset as DatasetBase, File as FileBase, EdgeFile as EdgeFileBase, NodeFile as NodeFileBase } from '@graphistry/js-upload-api';
import { version as VERSION } from './version.js';
import fetch, { Headers } from 'node-fetch';

const CLIENT_SUBSCRIPTION_API_VERSION = 1;

//export const Client = ClientBase;
export const Dataset = DatasetBase;
export const File = FileBase;
export const EdgeFile = EdgeFileBase;
export const NodeFile = NodeFileBase;

//FIXME not generating jsdoc
/**
 * Class wrapping @graphistry/js-upload-api::Client for client->server File and Dataset uploads.
 * @global
 * @extends ClientBase
 */
export class Client extends ClientBase {
    /**
     * Create a Client
     * @constructor
     * @param {string} username - Graphistry server username
     * @param {string} password - Graphistry server password
     * @param {string} [protocol='https'] - 'http' or 'https' for client->server upload communication
     * @param {string} [host='hub.graphistry.com'] - Graphistry server hostname
     * @param {clientProtocolHostname} clientProtocolHostname - Override URL base path shown in browsers. By default uses protocol/host combo, e.g., https://hub.graphistry.com
     * 
     * For more examples, see @graphistry/node-api and @graphistry/js-upload-api docs
     * 
     * @example **Authenticate against Graphistry Hub**
     * ```javascript
     * import { Client } from '@graphistry/client-api';
     * const client = new Client('my_username', 'my_password');
     * ```
    */
    constructor(
        username: string, password: string,
        protocol = 'https', host = 'hub.graphistry.com',
        clientProtocolHostname?: string,
        version: string = VERSION
    ) {
        console.debug('new client', { username }, { password }, { protocol }, { host }, { clientProtocolHostname }, { version });
        super(
            username, password, protocol, host,
            clientProtocolHostname,
            fetch,
            version,
            '@graphistry/node-api');
    }
}
