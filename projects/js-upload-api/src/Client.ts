import  fetch  from 'node-fetch';
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
 * @example **Authenticate against Graphistry Hub**
 * ```javascript
 * import { Client } from '@graphistry/node-api';
 * const client = new Client('my_username', 'my_password');
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
 */
export class Client {

    public readonly username: string;
    private _password: string;
    public readonly protocol: string;
    public readonly host: string;
    public readonly clientProtocolHostname: string;

    private _token?: string;
    private _version?: string;

    /**
     * @param username The username to authenticate with.
     * @param password The password to authenticate with.
     * @param protocol The protocol to use for the server during uploads: 'http' or 'https'.
     * @param host The hostname of the server during uploads: defaults to 'hub.graphistry.com'
     * @param clientProtocolHostname Base path to use inside the browser and when sharing public URLs: defaults to '{protocol}://{host}'
     */
    constructor (
        username: string, password: string,
        protocol = 'https', host = 'hub.graphistry.com',
        clientProtocolHostname?: string,
        fetch?: any,
        version?: string
    ) {
        this.username = username;
        this._password = password;
        this.protocol = protocol;
        this.host = host;
        this.clientProtocolHostname = clientProtocolHostname || `${protocol}://${host}`;
        this.getAuthToken();
    }

    /**
     * @internal
     * Internal helper
     * @param uri The URI to upload to.
     * @param payload The payload to upload. 
     * @returns The response from the server. 
     */
    public async post(uri: string, payload: any): Promise<any> {
        const headers = await this.getSecureHeaders();
        const response = await this.postToApi(uri, payload, headers);
        return response;
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

     public isServerConfigured(): boolean {
        console.debug('isServerConfigured', {username: this.username, _password: this._password, host: this.host});
        return this.username !== '' && this._password !== '' && this.host !== '';
    }

    private async getAuthToken(force = false): Promise<string> {
        if (!force && this.authTokenValid()) {
            return this._token || '';  // workaround ts not recognizing that _token is set
        }

        const response = await this.postToApi(
            'api/v2/auth/token/generate',
            { username: this.username, password: this._password },
            this.getBaseHeaders(),
        )

        const tok : string = response.token;
        this._token = tok;
        return tok;
    }

    private authTokenValid(): boolean {
        const out = !!this._token;
        return out;
    }

    private async postToApi(url: string, data: any, headers: any): Promise<any> {
        const response = await fetch(this.getBaseUrl() + url, { // change this
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        })
        return await response.json();
    }

    private getBaseHeaders(): any {
        return ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
    }
    
    private async getSecureHeaders(): Promise<any> {
        const headers = this.getBaseHeaders();
        const tok = await this.getAuthToken();
        headers.append('Authorization', `Bearer ${tok}`);
        return headers;
    }

    private getBaseUrl(): string {
        return `${this.protocol}://${this.host}/`;
    }
}