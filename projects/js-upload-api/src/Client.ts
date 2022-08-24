import { resolve } from "path";

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
    public authUrl?: Promise<string>;
    public readonly protocol: string;
    public readonly host: string;
    public readonly clientProtocolHostname: string;
    public readonly agent: string;
    public readonly version?: string;


    private _getAuthTokenPromise?: Promise<string>;  // undefined if not configured

    private _token?: string;

    private fetch: any;  // eslint-disable-line @typescript-eslint/no-explicit-any

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
        fetch?: any,  // eslint-disable-line @typescript-eslint/no-explicit-any
        version?: string,
        agent = '@graphistry/js-upload-api',
        isSSO = true,
    ) {
        this.username = username;
        this._password = password;
        this.protocol = protocol;
        this.host = host;
        this.fetch = fetch;
        this.version = version;
        this.agent = agent;
        this.clientProtocolHostname = clientProtocolHostname || `${protocol}://${host}`;

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
        console.debug('isServerConfigured', {username: this.username, _password: this._password, host: this.host});
        return (this.username || '') !== '' && (this._password || '') !== '' && (this.host || '') !== '';
    }

    public checkStale(username: string, password: string, protocol: string, host: string, clientProtocolHostname?: string): boolean {
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
        return false;
    }

    public static isConfigurationValid(username: string, password: string, host: string): boolean {
        console.debug('isConfigurationValid', {username: username, password: password, host: host});
        return (username || '') !== '' && (password || '') !== '' && (host || '') !== '';
    }

 
    private async ssoLogin(): Promise<any> {   // keep calling to api based on rate limit
        const state = await this.getAuthUrl();
        console.log(state.state);
          let data = '';
          let num = 1;
          setTimeout(async () => {
            while(num = 1) { //setTimeOut
            const response = await (this.fetch)(`https://eks-skinny.grph.xyz/api/v2/o/sso-org/sso/oidc/jwt/${state.state}`, {
                method: 'POST', 
                headers: { //CORS ISSUE
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
                },
                body: JSON.stringify(data)
            });
            data = await response.json();
            console.log(data);
            if (data) {
                 console.log('data with jwt', data);
                 num = 2;
                return data;
            }
            // if (timeElapsed > 90 seconds) {
            //     throw new Error('Timeout');
            // }
            // await sleep 3s;
            // */
            // return data;
        } 
            }, 3000);
        if (timeElasped > 9000) {
            throw new Error('Timeout');
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
        const response = await (this.fetch)(this.getBaseUrl() + url, { // change this
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        })
        console.debug('postToApi', {url, data, headers, response});
        return await response.json();
    }
    
    private async getAuthUrlHelper(url: any, data:any, headers: any): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.debug(url, data, headers);
        console.debug('getAuthUrl', {url, data, headers});

         const authCallback = (this.fetch)( url, {
             method: 'POST',
             headers,
             body: JSON.stringify(data),
      })
      .then((response:any) => response.json()) // eslint-disable-line @typescript-eslint/no-explicit-any
      .then((data:any) => {
        console.log({"data":data,"State":data.data.state,"_authUrl":data.data.auth_url, "status": data.status});
         if (data.status !== 'OK'){
            console.error('Error in getting auth url', {url, data, headers});
            throw new Error('Error fetching popup window: non-OK server response');
        }
        return data;
      }) // eslint-disable-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.error('getAuthUrl response error', error); //TODO notify user of error
        throw new Error('Error fetching popup window');
      });
      console.debug(authCallback); 
      
     }
    
   
    private async getAuthUrl(): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.debug('testing authResponse is running');
        const orgAndIdp = '/api/v2/o/sso-org/sso/oidc/login/gokta/'; //works
        // const noOrgOrIdp = '/api/v2/g/sso/oidc/login/'; // not working
        // const onlyOrg = 'api/v2/o/sso-org/sso/oidc/login/'; // not working
        const url = this.getBaseAuthUrl() + orgAndIdp;   
        const response = await this.getAuthUrlHelper(
         url, //url
         { }, 
         this.getBaseHeaders(), //headers
     )
         //this.authUrl = response.then(data => data.data.auth_url);
         console.debug('getAuthUrl authResponse resolved', { response });
         console.debug(response.data.auth_url); // delete 
         return response.data;
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

     private getBaseAuthUrl(): string {
         return 'https://eks-skinny.grph.xyz';
    }

    private getBaseUrl(): string {
        return `${this.protocol}://${this.host}/`;
    }
}