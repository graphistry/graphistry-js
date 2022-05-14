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


/**
 * # File examples
 * 
 * For configured supported file formats, see https://hub.graphistry.com/docs/api/2/rest/files/
 * 
 * @example **Upload an {@link EdgeFile} from a JSON object**
 * ```javascript
 * import { EdgeFile } from '@graphistry/node-api';
 * const edgesFile = new EdgeFile({'s': ['a', 'b', 'c'], 'd': ['d', 'e', 'f'], 'v': ['v1', 'v2', 'v3']});
 * await edgesFile.upload(client);
 * console.log(`EdgeFile uploaded as ID ${edgesFile.fileID}`);
 * ```
 * 
 * <br>
 * 
 * @example **Upload an {@link EdgeFile} using promises**
 * ```javascript
 * import { EdgeFile } from '@graphistry/node-api';
 * const edgesFile = new EdgeFile({'s': ['a', 'b', 'c'], 'd': ['d', 'e', 'f'], 'v': ['v1', 'v2', 'v3']});
 * edgesFile.upload(client).then(
 *  () => console.log(`EdgeFile uploaded as ID ${edgesFile.fileID}`)
 * ).catch(err => console.error('oops', err));
 * ```
 * 
 * <br>
 * 
 * @example **Upload a {@link NodeFile} from a JSON object**
 * ```javascript
 * import { NodeFile } from '@graphistry/node-api';
 * const nodesFile = new NodeFile({'n': ['a', 'b', 'c']});
 * await nodesFile.upload(client);
 * console.log(`NodeFile uploaded as ID ${nodesFile.fileID}`);
 * 
 * <br>
 * 
 * @example **Create a {@link File} by ID (e.g., previously uploaded) for use with {@link Dataset}s**
 * ```javascript
 * import { EdgeFile, Dataset } from '@graphistry/node-api';
 * const edgesFile = new EdgeFile('my_file_id');
 * await (new Dataset(bindings, edgesFile)).upload(client);
 * console.log(`Dataset uploaded as ID ${dataset.datasetID}`);
 * ```
 */
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

    public readonly createOpts: Record<string, any>;
    public readonly uploadUrlOpts: string;
    public readonly fileFormat: string;
    public readonly name: string;
    public readonly type: FileType;

    ////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Create a new {@link File} object for uploading or use with {@link Dataset}
     * 
     * For more information on the available options, see:
     *   * Creation step metadata options: https://hub.graphistry.com/docs/api/2/rest/files/ 
     *   * Upload step options: https://hub.graphistry.com/docs/api/2/rest/files/#uploadfiledata
     * 
     * @param type FileType.Node or FileType.Edge
     * @param data Payload to pass to node-fetch 
     * @param fileFormat File format to use, e.g. 'json', 'csv', 'arrow', 'parquet', 'orc', 'xls' 
     * @param name Name of the file to use, e.g. 'my-file' 
     * @param createOpts JSON post body options to use in createFile()
     * @param uploadUrlOpts URL options to use in uploadData()
     */
    constructor(type: FileType, data: any = undefined, fileFormat = 'json', name = 'my file', createOpts = {}, uploadUrlOpts = '') {
        if (typeof(data) == 'string') {
            this._fileID = data;
            this._fileCreated = true;
            this._fileUploaded = true;
        } else {
            this._data = data;
        }
        this.createOpts = createOpts;
        this.uploadUrlOpts = uploadUrlOpts;
        this.fileFormat = fileFormat;
        this.name = name;
        this.type = type;
    }

    ////////////////////////////////////////////////////////////////////////////////

    /**
     * Upload curent {@link File} object to the server
     * 
     * By default, this will skip reuploading files that have already been uploaded.
     * 
     * @param client {@link Client} object to use for uploading
     * @param force If true, will force upload even if file has already been uploaded
     * @returns Promise that resolves to the uploaded File object when it completes uploading
     */
    public async upload(client : Client, force = false): Promise<File> {

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

    /**
     * Helper function to create the file on the server but not yet upload its data
     * 
     * By default, this will skip recreating files that have already been created.
     * 
     * @param client {@link Client} object to use for uploading
     * @param force If true, will force creation of a new ID even if file has already been uploaded 
     * @returns 
     */
    public async createFile(client : Client, force = false): Promise<any | boolean> {
        if (!force && this._fileCreated) {
            return this._fileCreated;
        }

        const fileJsonResults = await client.post('api/v2/files/', {file_type: this.fileFormat, ...this.createOpts});
        this._fileCreateResponse = fileJsonResults;
        this._fileID = fileJsonResults.file_id;
        this._fileCreated = !!fileJsonResults.file_id;
        return fileJsonResults;
    }

    /**
     * Helper function to upload the data to the server
     * 
     * By default, this will skip reuploading data that has already been uploaded.
     * 
     * @param client {@link Client} object to use for uploading
     * @param force If true, will force upload even if file has already been uploaded
     * @returns 
     */
    public async uploadData(client : Client, force = false): Promise<any | boolean> {
        if (!force && this._fileUploaded) {
            return this._fileUploaded;
        }
        this.fillMetadata(this._data);
        const results = await client.post(
            `api/v2/upload/files/${this._fileID}${ this.uploadUrlOpts ? `?${this.uploadUrlOpts}` : ''}`,
            this._data
        );
        this._fileUploadResponse = results;
        this._fileUploaded = !!results.is_uploaded;
        return results;
    }

    /**
     * Populate data for later uploading if it wasn't set during construction
     * 
     * Cannot run this function if the file has already been uploaded
     * 
     * Overwrites any existing data
     * 
     * @param data Data to use for uploading  
     */
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

/**
 * Helper class for creating a File object for uploading: See File constructor
 */
export class EdgeFile extends File {
    constructor(data: any = undefined, fileFormat = 'json', name = 'my file', urlOpts = '') {
        super(FileType.Edge, data, fileFormat, name, urlOpts);
    }
}

/**
 * Helper class for creating a File object for uploading: See File constructor
 */
export class NodeFile extends File {
    constructor(data: any = undefined, fileFormat = 'json', name = 'my file', urlOpts = '') {
        super(FileType.Node, data, fileFormat, name, urlOpts);
    }
}