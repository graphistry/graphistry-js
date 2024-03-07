import { AbstractClient } from './AbstractClient.js';

const AUTH_API_ENDPOINT = 'api/v2/auth/pkey/jwt/';

/**
 * # Client examples
 * 
 * Authenticate against a Graphistry server and manage communications with it.
 * 
 * Different authentication modes may be desirable depending on the type of Graphistry server.
 * 
 * <br>
 * 
 * ---
 * 
 * <br>
 *  
 * @example **Authenticate against Graphistry Hub for a personal account**
 * ```javascript
 * import { Client } from '@graphistry/node-api';
 * const client = new Client('my_username', 'my_password');
 * ```
 * 
 * <br>
 *  
 * @example **Authenticate against an org in Graphistry Hub**
 * ```javascript
 * import { Client } from '@graphistry/node-api';
 * const client = new Client('my_username', 'my_password', 'my_org');
 * ```
 * 
 * <br>
 * 
 * @example **Authenticate against a private Graphistry server**
 * ```javascript
 * import { Client } from '@graphistry/node-api';
 * const client = new Client('my_username', 'my_password', 'http', 'my-ec2.aws.com:8080');
 * ```
 * 
 * <br>
 * 
* @example **Upload via internal IP but publish urls via a public domain**
 * ```javascript
 * import { Client } from '@graphistry/node-api';
 * const client = new Client(
 *  'my_username', 'my_password',
 *  'http', '10.20.0.1:8080',
 *  'https://www.my-site.com'
 * );
 * ```
 * 
 * <br>
 * 
 * @example **Upload through the local docker network but publish urls via a public domain**
 * ```javascript
 * import { Client } from '@graphistry/node-api';
 * const client = new Client(
 *  'my_username', 'my_password',
 *  'http', 'nginx',
 *  'https://www.my-site.com'
 * );
 * ```
 * 
 * <br>
 * 
 * @example **Create a client with an externally-provided JWT token**
 * ```javascript
 * import { Client } from '@graphistry/node-api';
 * const client = new Client();
 * client.setToken('Bearer 123abc');
 * ```
 */

export class ClientPkey extends AbstractClient {

    public readonly personalKeyId: string;
    private _personalKeySecret: string;

    /**
     * 
     * See examples at top of file
     * 
     * @param personalKeyId The personal key id to authenticate with.
     * @param personalKeySecret The personal key secret to authenticate with.
     * @param org The organization to use (optional)
     * @param protocol The protocol to use for the server during uploads: 'http' or 'https'.
     * @param host The hostname of the server during uploads: defaults to 'hub.graphistry.com'
     * @param clientProtocolHostname Base path to use inside the browser and when sharing public URLs: defaults to '{protocol}://{host}'
     * @param fetch The fetch implementation to use
     * @param version The version of the client library
     * @param agent The agent name to use when communicating with the server
     */
    constructor (
        personalKeyId: string, personalKeySecret: string, org?: string,
        protocol = 'https', host = 'hub.graphistry.com',
        clientProtocolHostname?: string,
        fetch?: any,  // eslint-disable-line @typescript-eslint/no-explicit-any
        version?: string,
        agent = '@graphistry/js-upload-api',
    ) {
        super(org, protocol, host, clientProtocolHostname, fetch, version, agent);

        this.personalKeyId = personalKeyId;
        this._personalKeySecret = personalKeySecret;

        if (this.isServerConfigured()) {
            this._getAuthTokenPromise = this.getAuthToken();
        }
    }

    public isServerConfigured(): boolean {
        console.debug('isServerConfigured', {personalKeyId: this.personalKeyId, _personalKeySecret: this._personalKeySecret, host: this.host});
        return (this.personalKeyId || '') !== '' && (this._personalKeySecret || '') !== '' && (this.host || '') !== '';
    }

    public checkStale(personalKeyId: string, personalKeySecret: string, protocol: string, host: string, clientProtocolHostname?: string): boolean {
        if (this.personalKeyId !== personalKeyId) {
            console.debug('personalKeyId changed', {currentPersonalKeyId: this.personalKeyId, newPersonalKeyId: personalKeyId}, this);
            return true;
        }
        if (this._personalKeySecret !== personalKeySecret) {
            console.debug('personalKeySecret changed', {currentPersonalKeySecret: this._personalKeySecret, newPersonalKeySecret: personalKeySecret}, this);
            return true;
        }
        if (this.protocol !== protocol) {
            console.debug('protocol changed', {currentProtocol: this.protocol, newProtocol: protocol}, this);
            return true;
        }
        if (this.host !== host) {
            console.debug('host changed', {currentHost: this.host, newHost: host}, this);
            return true;
        }
        if (this.clientProtocolHostname !== clientProtocolHostname) {
            console.debug('clientProtocolHostname changed', {currentClientProtocolHostname: this.clientProtocolHostname, newClientProtocolHostname: clientProtocolHostname}, this);
            return true;
        }
        return false;
    }

    /**
     * Get the authentication token for the current user.
     * By default, reuses current token if available.
     * 
     * @param force If true, forces a new token to be generated; defaults to false
     * 
     * @returns The authentication token
     * 
     */
    protected async getAuthToken(force = false): Promise<string> {
        if (!force && this.authTokenValid()) {
            return this._token || '';  // workaround ts not recognizing that _token is set
        }

        //Throw exception if invalid personalKeyId or personalKeySecret
        if (!this.isServerConfigured()) {
            console.debug('current config', {personalKeyId: this.personalKeyId, _personalKeySecret: this._personalKeySecret, host: this.host});
            throw new Error('Invalid personalKeyId or personalKeySecret');
        }

        if (!force && this._getAuthTokenPromise) {
            console.debug('reusing outstanding auth promise');
            return await this._getAuthTokenPromise;
        }

        console.debug('getAuthToken', {personalKeyId: this.personalKeyId, personalKeySecret: this._personalKeySecret, host: this.host});

        const response = await this.getToApi(
            AUTH_API_ENDPOINT,
            {
                "Authorization": `PersonalKey ${this.personalKeyId}:${this._personalKeySecret}`,
            },
        )

        const tok : string = response.token;
        this._token = tok;

        if (!this.authTokenValid()) {
            console.error('auth token failure', {response, personalKeyId: this.personalKeyId, host: this.host});
            throw new Error({'error': 'Auth token failure', ...(response||{})});
        }

        return tok;
    }

    /**
     * 
     * @param personalKeyId 
     * @param password 
     * @param org 
     * @param protocol 
     * @param host 
     * @returns Promise for the authentication token
     * 
     * Helper to fetch a token for a given user
     * 
     */
    public async fetchToken(
        personalKeyId: string, personalKeySecret: string, org?: string, protocol = 'https', host = 'hub.graphistry.com'
    ): Promise<string> {
        return (await this.getToApi(
            AUTH_API_ENDPOINT,
            {
                "Authorization": `PersonalKey ${personalKeyId}:${personalKeySecret}`,
            },
            `${protocol}://${host}/`
        )).token;
    }
}