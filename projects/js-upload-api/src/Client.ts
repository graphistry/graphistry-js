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
    public readonly agent: string;
    public readonly version?: string;
    public isSSO: boolean;
    public authenticated: boolean;
    public stopFromLoading: boolean;


    private _getAuthTokenPromise?: Promise<string>;  // undefined if not configured

    private _token?: string;

    public fetch: any;  // eslint-disable-line @typescript-eslint/no-explicit-any

    /**
     * @param username The username to authenticate with. Not required if SSO.
     * @param password The password to authenticate with. Not required if SSO.
     * @param protocol The protocol to use for the server during uploads: 'http' or 'https'.
     * @param host The hostname of the server during uploads: defaults to 'hub.graphistry.com'
     * @param clientProtocolHostname Base path to use inside the browser and when sharing public URLs: defaults to '{protocol}://{host}'
     */
    constructor (
        username = '', password = '',
        protocol = 'https', host = 'hub.graphistry.com',
        clientProtocolHostname?: string,
        fetch?: any,  // eslint-disable-line @typescript-eslint/no-explicit-any
        version?: string,
        agent = '@graphistry/js-upload-api',
        isSSO = false, 
        authenticated = false,
        stopFromLoading = false
    ) {
        this.isSSO = isSSO;
        this.authenticated = authenticated;
        this.stopFromLoading = stopFromLoading;
        this.username = username;
        this._password = password;
        this.protocol = protocol;
        this.host = host;
        this.fetch = fetch;
        this.version = version;
        this.agent = agent;
        this.clientProtocolHostname = clientProtocolHostname || `${protocol}://${host}`;
        if (isSSO && authenticated) {
            this._getAuthTokenPromise = this.ssoLogin();
        }
        else if (this.isServerConfigured()) {
            this._getAuthTokenPromise = this.getAuthToken();
    }
}

    /**
     * @internal
     * Internal helper
     * @param uri The URI to upload to.
     * @param payload The payload to upload. 
     * @returns The response from the server. 
     */
    public async post(uri: string, payload: any): Promise<any> {  // eslint-disable-line @typescript-eslint/no-explicit-any
        console.debug('post', {uri, payload});
        const headers = await this.getSecureHeaders();
        console.debug('post', {headers});
        const response = await this.postToApi(uri, payload, headers);
        console.debug('post response', {uri, payload, response});
        return response;
    }



    public isServerConfigured(): boolean {
        console.debug('isServerConfigured', {username: this.username, _password: this._password, host: this.host, isSSO: this.isSSO});
        return ((this.username || '') !== '' && (this._password || '') !== '' && (this.host || '') !== '') || this.isSSO;
    }

    public checkStale(username: string, password: string, protocol: string, host: string, clientProtocolHostname?: string, isSSO?: boolean, authenticated?: boolean, stopFromLoading?: boolean): boolean {
        if (this.username !== username) {
            console.debug('username changed', {currentUsername: this.username, newUsername: username}, this);
            return true;
        }
        if (this._password !== password) {
            console.debug('password changed', {currentPassword: this._password, newPassword: password}, this);
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
        // if (this.version !== version) {
        //     console.debug('version changed', {current: this.version, newVersion: version }, this);
        //     return true;
        // }
        if (this.isSSO !== isSSO) {
            console.debug('isSSO changed', {current: this.isSSO, newIsSSO: isSSO }, this);
            return true;   
        }
        if (this.authenticated !== authenticated) {
            console.debug('authentication changed', {current: this.authenticated, newAuthenticated: authenticated }, this);
            return true;   
        }
        if (this.stopFromLoading !== stopFromLoading) {
            console.debug('stop from loading var has changed', {current: this.stopFromLoading, newStopFromLoading: stopFromLoading }, this);
            return true;   
        }
        return false;
    }
    
    public static isConfigurationValid(username: string, password: string, host: string): boolean {
        console.debug('isConfigurationValid', {username: username, password: password, host: host});
        return (username || '') !== '' && (password || '') !== '' && (host || '') !== '';
    }



    public async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }  
      //TODO cancel if new client
    public async ssoLogin(): Promise<any> {   // keep calling to api based on rate limit
        //TODO validate input
        console.log('ssoLogin before the authentication, youre number ?')
        if (this.authenticated && this.stopFromLoading) {
        const state = await this.getAuthUrl();   
        const url = state.auth_url;
        console.log(url); //this is auth
        console.log(state.state);
        const startedMS = Date.now();
   
        await this.delay(200); //short initial delay as may already be logged in
        while(true) {
            console.log('later in the ssologin loop, youre number ?')
            await this.delay(20000);
            const response = await (this.fetch)(`https://eks-skinny.grph.xyz/api/v2/o/sso/oidc/jwt/${state.state}/`, {
                method: 'GET', 
            });
            await this.delay(15000);
            console.log('authenticated');
            console.info('ssoLogin response');
            const data = await response.json(); // only do this if theyre done being authenticated/logged in
            if (data) { //TODO and whatever success conditions
                console.log('data with good jwt', data);
                data['data']['auth_url'] = url;
                return data;
            }
            //TODO check if expected not-ready rejection, else throw unexpected error
            if (Date.now() - startedMS > 60000) {
                console.error('sso login timed out');
                throw new Error('sso login timed out');
            }
            await this.delay(1000);
            }
        }
    }

    

            /*
            (conditionally called by constructor instead of getAuthToken)
        TOD: if SSO: polling loop on popup flow being done (server says yes its completed)
        rate limit: 1 request per 3 second (configurable)
        if takes more than 20s (configurable), throw exception
        I think it returns the JWT, so can save and return the response instead of going further here
        
*/
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
            console.debug('current config', {username: this.username, _password: this._password, host: this.host});
            throw new Error('Invalid username or password');
        }

        if (!force && this._getAuthTokenPromise) {
            console.debug('reusing outstanding auth promise');
            return await this._getAuthTokenPromise;
        }
        console.debug('just checking if updating')
        console.debug('getAuthToken', {username: this.username, _password: this._password, host: this.host});
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

    private async postToApi(url: string, data: any, headers: any): Promise<any> {    // eslint-disable-line @typescript-eslint/no-explicit-any
        console.debug('postToApi', {url, data});
        const response = await this.fetch(this.getBaseUrl() + url, { // change this
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        })
        console.debug('postToApi', {url, data, headers, response});
        return await response.json();
    }
     

    private userLoginInfo (): any { // eslint-disable-line @typescript-eslint/no-explicit-any
        // just incase i break stuff : /api/v2/o/sso-org/sso/oidc/login/gokta/
        const org = ''; // change to input of user
        const idp = ''; // change to input of user

        const noOrgOrIdp = '/api/v2/g/sso/oidc/login/'; // sso-org + gokta should be var/ input from screen
        const onlyOrg = `api/v2/o/${org}/sso/oidc/login/`;
        const orgAndIdp = `api/v2/o/${org}/sso/oidc/login/${idp}/`; 
            if ( org !== '' && idp !== '' ) { //
                 return orgAndIdp;
             } else if (org !== '' && idp == '') { // no idp
                 return onlyOrg;
             } else {  
                return noOrgOrIdp; 
            }
     }
    
    public async getAuthUrlHelper( url?: any, data?:any, headers?: any): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        // console.debug( url, data, headers);
        // console.debug('getAuthUrl', { url, data, headers});
        // eslint-disable-next-line prefer-const

        if(this.authenticated) {
            console.log('authHelper very early, youre number ? ')
        const authCallback =  await this.fetch( url, { // this fetch not a function
             method: 'POST',
             headers,
             body: JSON.stringify(data),
      })
      .then(async (response:any) => await response.json())  // eslint-disable-line @typescript-eslint/no-explicit-any 
      .then(async (data:any) => { // eslint-disable-line @typescript-eslint/no-explicit-any 
        console.log('authhelper once youve gotten data, youre number ? ')
        console.log({"data":data,"State":data.data.state,"_authUrl":data.data.auth_url, "status": data.status});
        if (data.status !== 'OK' ){
            console.error('Error in getting auth url', {url, data, headers});
            throw new Error('Error fetching popup window: non-OK server response');
        }
        console.debug('This is data', data.status); 
        return await data;
      }) 
      .catch((error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('getAuthUrl response error', error); //TODO notify user of error
        throw new Error('Error fetching popup window');
      });
      return await authCallback;
    }
    }

    public async getAuthUrl(): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.debug('testing authResponse is running');
        // eslint-disable-next-line prefer-const
        const url = this.getBaseAuthUrl() + this.userLoginInfo(); 
        const response = await this.getAuthUrlHelper( 
        url, // getting the auth url
        { }, 
        this.getBaseHeaders(), //headers
     )
         //this.authUrl = response.then(data => data.data.auth_url);
        console.log('getAUTHURL youre number ?')
        console.debug('getAuthUrl authResponse resolved', { response });
        console.debug('this is the auth link', response.data.auth_url); // delete 
        return await response.data
    }

    private getBaseHeaders(): any {    // eslint-disable-line @typescript-eslint/no-explicit-any
        return ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
    }
    
    private async getSecureHeaders(): Promise<any> {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const headers = this.getBaseHeaders();
        const tok = await this.getAuthToken();
        console.debug('getSecureHeaders', {headers, tok});
        headers.Authorization = `Bearer ${tok}`;
        console.debug('getSecureHeaders', {headers});
        return headers;
    }

     public getBaseAuthUrl(): string {
         return 'https://eks-skinny.grph.xyz';
    }

    private getBaseUrl(): string {
        return `${this.protocol}://${this.host}/`;
    }
}