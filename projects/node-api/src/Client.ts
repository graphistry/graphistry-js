/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch, { Headers } from 'node-fetch';

export class Client {

    private _username: string;
    private _password: string;
    private _protocol: string;
    private _host: string;
    private _clientProtocolHostname: string;

    private _token?: string;

    constructor (
        username: string, password: string,
        protocol = 'https', host = 'hub.graphistry.com',
        clientProtocolHostname = 'https://hub.graphistry.com'
    ) {
        this._username = username;
        this._password = password;
        this._protocol = protocol;
        this._host = host;
        this._clientProtocolHostname = clientProtocolHostname;
        this.getAuthToken();
    }

    public async post(uri: string, payload: any): Promise<any> {
        const headers = await this.getSecureHeaders();
        const response = await this.postToApi(uri, payload, headers);
        return response;
    }

    private async getAuthToken(force = false): Promise<string> {
        if (!force && this.authTokenValid()) {
            return this._token || '';  // workaround ts not recognizing that _token is set
        }

        const response = await this.postToApi(
            'api/v2/auth/token/generate',
            { username: this._username, password: this._password },
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

    private async postToApi(url: string, data: any, headers: Headers): Promise<any> {
        const response = await fetch(this.getBaseUrl() + url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        })
        return response.json()
    }

    private getBaseHeaders(): Headers {
        return new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
    }
    
    private async getSecureHeaders(): Promise<Headers> {
        const headers = this.getBaseHeaders();
        const tok = await this.getAuthToken();
        headers.append('Authorization', `Bearer ${tok}`);
        return headers;
    }

    private getBaseUrl(): string {
        return `${this._protocol}://${this._host}/`;
    }
}