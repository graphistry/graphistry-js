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
 */
export class Client {

    public readonly username: string;
    private _password: string;
    public readonly protocol: string;
    public readonly host: string;
    public readonly clientProtocolHostname: string;
    public readonly agent: string;
    public readonly version?: string;
    public readonly org?: string;


    private _getAuthTokenPromise?: Promise<string>;  // undefined if not configured

    private _token?: string;

    private fetch: any;  // eslint-disable-line @typescript-eslint/no-explicit-any

    /**
     * 
     * See examples at top of file
     * 
     * @param username The username to authenticate with.
     * @param password The password to authenticate with.
     * @param org The organization to use (optional)
     * @param protocol The protocol to use for the server during uploads: 'http' or 'https'.
     * @param host The hostname of the server during uploads: defaults to 'hub.graphistry.com'
     * @param clientProtocolHostname Base path to use inside the browser and when sharing public URLs: defaults to '{protocol}://{host}'
     * @param fetch The fetch implementation to use
     * @param version The version of the client library
     * @param agent The agent name to use when communicating with the server
     */
    constructor (
        username: string, password: string, org?: string,
        protocol = 'https', host = 'hub.graphistry.com',
        clientProtocolHostname?: string,
        fetch?: any,  // eslint-disable-line @typescript-eslint/no-explicit-any
        version?: string,
        agent = '@graphistry/js-upload-api',
    ) {
        this.username = username;
        this._password = password;
        this.org = org;
        this.protocol = protocol;
        this.host = host;
        this.fetch = fetch;
        this.version = version;
        this.agent = agent;
        this.clientProtocolHostname = clientProtocolHostname || `${protocol}://${host}`;
        if (this.isServerConfigured()) {
            this._getAuthTokenPromise = this.getAuthToken();
        }
    }

    /**
     * 
     * See examples at top of file
     * 
     * Set JWT token if already known
     * 
     * @param token The token to use for authentication.
     * @returns The client instance.
     */
    public setToken(token: string) {
        this._token = token;
        return this;
    }

    /**
     * @internal
     * Internal helper
     * @param uri The URI to upload to.
     * @param payload The payload to upload. 
     * @param baseHeaders Optionally override base header object to mix with auth header for the upload.
     * @returns The response from the server. 
     */
    public async post(uri: string, payload: any, baseHeaders: any = undefined): Promise<any> {  // eslint-disable-line @typescript-eslint/no-explicit-any
        console.trace('post', {uri, payload});
        const headers = await this.getSecureHeaders(baseHeaders);
        console.trace('post', {headers});
        const response = await this.postToApi(uri, payload, headers);
        console.trace('post response', {uri, payload, response});
        return response;
    }



    public isServerConfigured(): boolean {
        console.trace('isServerConfigured', {username: this.username, _password: this._password, host: this.host});
        return (this.username || '') !== '' && (this._password || '') !== '' && (this.host || '') !== '';
    }

    public checkStale(username: string, password: string, protocol: string, host: string, clientProtocolHostname?: string): boolean {
        if (this.username !== username) {
            console.trace('username changed', {currentUsername: this.username, newUsername: username}, this);
            return true;
        }
        if (this._password !== password) {
            console.trace('password changed', {currentPassword: this._password, newPassword: password}, this);
            return true;
        }
        if (this.protocol !== protocol) {
            console.trace('protocol changed', {currentProtocol: this.protocol, newProtocol: protocol}, this);
            return true;
        }
        if (this.host !== host) {
            console.trace('host changed', {currentHost: this.host, newHost: host}, this);
            return true;
        }
        if (this.clientProtocolHostname !== clientProtocolHostname) {
            console.trace('clientProtocolHostname changed', {currentClientProtocolHostname: this.clientProtocolHostname, newClientProtocolHostname: clientProtocolHostname}, this);
            return true;
        }
        return false;
    }

    public static isConfigurationValid(username: string, password: string, host: string): boolean {
        console.trace('isConfigurationValid', {username: username, password: password, host: host});
        return (username || '') !== '' && (password || '') !== '' && (host || '') !== '';
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
    private async getAuthToken(force = false): Promise<string> {
        if (!force && this.authTokenValid()) {
            return this._token || '';  // workaround ts not recognizing that _token is set
        }

        //Throw exception if invalid username or password
        if (!this.isServerConfigured()) {
            console.trace('current config', {username: this.username, _password: this._password, host: this.host});
            throw new Error('Invalid username or password');
        }

        if (!force && this._getAuthTokenPromise) {
            console.debug('reusing outstanding auth promise');
            return await this._getAuthTokenPromise;
        }

        console.trace('getAuthToken', {username: this.username, _password: this._password, host: this.host});

        const response = await this.postToApi(
            'api/v2/auth/token/generate',
            {
                username: this.username,
                password: this._password,
                ...(this.org ? {org_name: this.org} : {}),
            },
            this.getBaseHeaders(),
        )

        const tok : string = response.token;
        this._token = tok;

        if (!this.authTokenValid()) {
            console.error('auth token failure', {response, username: this.username, host: this.host});
            throw new Error({'error': 'Auth token failure', ...(response||{})});
        }

        return tok;
    }

    /**
     * 
     * @param username 
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
        username: string, password: string, org?: string, protocol = 'https', host = 'hub.graphistry.com'
    ): Promise<string> {
        return (await this.postToApi(
            'api/v2/auth/token/generate',
            {
                username: username,
                password: password,
                ...(org ? {org_name: org} : {}),
            },
            this.getBaseHeaders(),
            `${protocol}://${host}/`
        )).token;
    }

    /**
     * 
     * @returns Whether the current token is valid
     * 
     */
    public authTokenValid(): boolean {
        const out = !!this._token;
        return out;
    }

    private async postToApi(url: string, data: any, headers: any, baseUrl?: string): Promise<any> {    // eslint-disable-line @typescript-eslint/no-explicit-any
        const resolvedFetch = this.fetch;
        console.trace('postToApi', {url, data, headers});
        const response = await resolvedFetch((baseUrl ?? this.getBaseUrl()) + url, { // change this
            method: 'POST',
            headers,
            body: 
                //TypedArray
                ArrayBuffer.isView(data) && !(data instanceof DataView) ? data
                : JSON.stringify(data),
        })
        console.trace('postToApi', {url, data, headers, response});
        return await response.json();
    }

    private getBaseHeaders(): any {    // eslint-disable-line @typescript-eslint/no-explicit-any
        return ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
    }
    
    private async getSecureHeaders(baseHeaders: any = undefined): Promise<any> {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const headers = baseHeaders || this.getBaseHeaders();
        const tok = await this.getAuthToken();
        console.trace('getSecureHeaders', {headers, tok});
        headers.Authorization = `Bearer ${tok}`;
        console.trace('getSecureHeaders', {headers});
        return headers;
    }

    private getBaseUrl(): string {
        return `${this.protocol}://${this.host}/`;
    }
}