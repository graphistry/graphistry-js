/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from './Client';

export enum FileType {
    Node,
    Edge,
}

export class File {
 
    private _data: any;
    private _fileId?:  string;
    private _fileCreated = false;
    private _fileUploaded = false;
    private _urlOpts: string;
    public fileType: string;
    public name: string;
    public type: FileType;

    public get fileID(): string {
        if (!this._fileId) {
            throw new Error('File ID is not set');
        }
        return this._fileId;
    }

    constructor(type: FileType, data: any, fileType = 'json', name = 'my file', urlOpts = '') {
        this._data = data;
        this._urlOpts = urlOpts;
        this.fileType = fileType;
        this.name = name;
        this.type = type;
    }

    public async createFile(client : Client, force = false): Promise<any | boolean> {
        if (!force && this._fileCreated) {
            return this._fileCreated;
        }
        const fileJsonResults = await client.post('api/v2/files/', {file_type: this.fileType});
        this._fileId = fileJsonResults.file_id;
        this._fileCreated = true;
        return fileJsonResults;
    }

    public async uploadData(client : Client, force = false): Promise<any | boolean> {
        if (!force && this._fileUploaded) {
            return this._fileUploaded;
        }
        const results = await client.post(
            `api/v2/upload/files/${this._fileId}${ this._urlOpts ? `?${this._urlOpts}` : ''}`,
            this._data
        );
        this._fileUploaded = results.is_uploaded;
        return results;
    }

    public setData(data: any) {
        this._data = data;
    }
}