/* eslint-disable @typescript-eslint/no-explicit-any */
import Debug from 'debug';
import { Client } from './Client.js';
import { version } from './version.js';
const debug = Debug('Client');


export enum FileType {
    Node,
    Edge
}


////////////////////////////////////////////////////////////////////////////////

export class File {

    ////////////////////////////////////////////////////////////////////////////////

    // Late-bindable by user

    private _data: any;
    public get data(): any | undefined { return this._data; }

    // Late-bound during uploads

    private _fileID?:  string;
    public get fileID(): string | undefined { return this._fileID; }

    private _fileCreated = false;
    public get fileCreated(): boolean { return this._fileCreated; }

    private _fileCreateResponse : any;
    public get fileCreateResponse(): any { return this._fileCreateResponse; }

    private _fileUploaded = false;
    public get fileUploaded(): any { return this._fileUploaded; }

    private _fileUploadResponse : any;
    public get fileUploadResponse(): any { return this._fileUploadResponse; }

    // Bound at creation

    public readonly urlOpts: string;
    public readonly fileType: string;
    public readonly name: string;
    public readonly type: FileType;

    ////////////////////////////////////////////////////////////////////////////////

    constructor(type: FileType, data: any = undefined, fileType = 'json', name = 'my file', urlOpts = '') {
        if (typeof(data) == 'string') {
            this._fileID = data;
            this._fileCreated = true;
            this._fileUploaded = true;
        } else {
            this._data = data;
        }
        this.urlOpts = urlOpts;
        this.fileType = fileType;
        this.name = name;
        this.type = type;
        
    }

    ////////////////////////////////////////////////////////////////////////////////

    public async upload(client : Client, force = false) {

        if (!client) { throw new Error('No client provided'); }

        await this.createFile(client, force);
        if (!this._fileID) {
            throw new Error('Unexpected file creation response, check file._fileCreateResponse');
        }

        await this.uploadData(client, force);
        if (!this._fileCreated) {
            throw new Error('Unexpected file upload response, check file._fileUploadResponse');
        }
        return this;
    }

    ////////////////////////////////////////////////////////////////////////////////

    public async createFile(client : Client, force = false): Promise<any | boolean> {
        if (!force && this._fileCreated) {
            return this._fileCreated;
        }

        const fileJsonResults = await client.post('api/v2/files/', {file_type: this.fileType});
        this._fileCreateResponse = fileJsonResults;
        this._fileID = fileJsonResults.file_id;
        this._fileCreated = !!fileJsonResults.file_id;
        return fileJsonResults;
    }

    public async uploadData(client : Client, force = false): Promise<any | boolean> {
        if (!force && this._fileUploaded) {
            return this._fileUploaded;
        }
        this.fillMetadata(this._data);
        const results = await client.post(
            `api/v2/upload/files/${this._fileID}${ this.urlOpts ? `?${this.urlOpts}` : ''}`,
            this._data
        );
        this._fileUploadResponse = results;
        this._fileUploaded = !!results.is_uploaded;
        return results;
    }

    public setData(data: any) {
        if (this._fileUploaded) {
            throw new Error('Cannot set data after file has been successfully uploaded');
        }
        this._data = data;
    }

    ///////////////////////////////////////////////////////////////////////////////

    private fillMetadata(data: any): void {
        if (!data) {
            throw new Error('No data to fill metadata; call setData() first or provide to File constructor');
        }

        if (!data['agent_name']) {
            data['agent_name'] = '@graphistry/node-api';
        }
        if (!data['agent_version']) {
            data['agent_version'] = version;
        }
    }

}

////////////////////////////////////////////////////////////////////////////////


export class EdgeFile extends File {
    constructor(data: any = undefined, name = 'my file', urlOpts = '') {
        super(FileType.Edge, data, 'json', name, urlOpts);
    }
}

export class NodeFile extends File {
    constructor(data: any = undefined, name = 'my file', urlOpts = '') {
        super(FileType.Node, data, 'json', name, urlOpts);
    }
}