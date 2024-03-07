export abstract class AbstractClient {
    public readonly protocol: string;
    public readonly host: string;
    public readonly clientProtocolHostname: string;
    public readonly agent: string;
    public readonly version?: string;
    public readonly org?: string;


    protected _getAuthTokenPromise?: Promise<string>;  // undefined if not configured

    protected _token?: string;

    protected fetch: any;  // eslint-disable-line @typescript-eslint/no-explicit-any

    /**
     * @param org The organization to use (optional)
     * @param protocol The protocol to use for the server during uploads: 'http' or 'https'.
     * @param host The hostname of the server during uploads: defaults to 'hub.graphistry.com'
     * @param clientProtocolHostname Base path to use inside the browser and when sharing public URLs: defaults to '{protocol}://{host}'
     * @param fetch The fetch implementation to use
     * @param version The version of the client library
     * @param agent The agent name to use when communicating with the server
     */
    constructor (
        org?: string,
        protocol = 'https', host = 'hub.graphistry.com',
        clientProtocolHostname?: string,
        fetchFn: any = fetch,
        version?: string,
        agent = '@graphistry/js-upload-api',
    ) {
        this.org = org;
        this.protocol = protocol;
        this.host = host;
        this.fetch = fetchFn;
        this.version = version;
        this.agent = agent;
        this.clientProtocolHostname = clientProtocolHostname || `${protocol}://${host}`;
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
     * 
     * @returns Whether the current token is valid
     * 
     */
    public authTokenValid(): boolean {
        const out = !!this._token;
        return out;
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
        console.debug('post', {uri, payload});
        const headers = await this.getSecureHeaders(baseHeaders);
        console.debug('post', {headers});
        const response = await this.postToApi(uri, payload, headers);
        console.debug('post response', {uri, payload, response});
        return response;
    }

    public static isConfigurationValid(username: string, password: string, host: string): boolean {
        console.debug('isConfigurationValid', {username: username, password: password, host: host});
        return (username || '') !== '' && (password || '') !== '' && (host || '') !== '';
    }

    protected async getToApi(url: string, headers: any, baseUrl?: string) {
        const resolvedFetch = this.fetch;
        console.debug('getToApi', {url, headers});
        const response = await resolvedFetch((baseUrl ?? this.getBaseUrl()) + url, {
            method: 'GET',
            headers,
        });
        console.debug('getToApi', {url, headers});
        return await response.json();
    }

    protected async postToApi(url: string, data: any, headers: any, baseUrl?: string): Promise<any> {    // eslint-disable-line @typescript-eslint/no-explicit-any
        const resolvedFetch = this.fetch;
        console.debug('postToApi', {url, data, headers});
        const response = await resolvedFetch((baseUrl ?? this.getBaseUrl()) + url, { // change this
            method: 'POST',
            headers,
            body: 
                //TypedArray
                ArrayBuffer.isView(data) && !(data instanceof DataView) ? data
                : JSON.stringify(data),
        })
        console.debug('postToApi', {url, data, headers, response});
        return await response.json();
    }

    protected getBaseHeaders(): any {    // eslint-disable-line @typescript-eslint/no-explicit-any
        return ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
    }

    protected getBaseUrl(): string {
        return `${this.protocol}://${this.host}/`;
    }

    private async getSecureHeaders(baseHeaders: any = undefined): Promise<any> {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const headers = baseHeaders || this.getBaseHeaders();
        const tok = await this.getAuthToken();
        console.debug('getSecureHeaders', {headers, tok});
        headers.Authorization = `Bearer ${tok}`;
        console.debug('getSecureHeaders', {headers});
        return headers;
    }

    public abstract isServerConfigured(): boolean;

    public abstract checkStale(username: string, password: string, protocol: string, host: string, clientProtocolHostname?: string): boolean;

    /**
     * Get the authentication token for the current user.
     * By default, reuses current token if available.
     * 
     * @param force If true, forces a new token to be generated; defaults to false
     * 
     * @returns The authentication token
     * 
     */
    protected abstract getAuthToken(): Promise<string>;

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
    public abstract fetchToken(
        username: string, password: string, org?: string, protocol?: string, host?: string
    ): Promise<string>
}