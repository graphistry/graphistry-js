/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from './Client.js';


/**
 * @internal
 * 
 * <br>
 * 
 * ## FileType
 * 
 * Enumeration used by {@link File} subclasses {@link EdgeFile} and {@link NodeFile} to specify whether the file is a node or edge file.
 * 
 * Primarily useful for TypeScript and runtime checks to avoid mixups when passing {@link File} objects to {@link Dataset} 
 * 
 */
export enum FileType {
    Node,
    Edge
}


////////////////////////////////////////////////////////////////////////////////


/**
 * # File examples
 * 
 * {@link File} objects are used for uploading data and then reusing as part of {@link Dataset} graph visualizations
 * 
 * Powerfully, the same file may be reused in multiple {@link Dataset}s, so many variants can be made cheaply and quickly.
 * 
 * For configuring supported file formats, see https://hub.graphistry.com/docs/api/2/rest/files/ .
 * 
 * <br>
 * 
 * ---
 * 
 * <br>
 * 
 * @example **Upload an {@link EdgeFile} from a JSON object in a columnar form**
 * ```javascript
 * import { EdgeFile } from '@graphistry/node-api';
 * const edgesFile = new EdgeFile(
 *      {
 *          's': ['a', 'b', 'c'],
 *          'd': ['d', 'e', 'f'],
 *          'v': ['v1', 'v2', 'v3']
 *      }
 * );
 * await edgesFile.upload(client);
 * console.log(`EdgeFile uploaded as ID ${edgesFile.fileID}`);
 * ```
 * 
 * <br>
 * 
 * @example **Upload an {@link EdgeFile} from a JSON object in a row-oriented form**
 * ```javascript
 * import { EdgeFile } from '@graphistry/node-api';
 * const edgesFile = new EdgeFile(
 *      [
 *          {'s': 'a', 'd': 'd', 'v': 'v1'},
 *          {'s': 'b', 'd': 'e', 'v': 'v2'},
 *          {'s': 'c', 'd': 'f', 'v': 'v3'}
 *      ],
 *      'json',
 *      'my nodes file',
 * 
 *      // JSON parsing options:
 *      // - https://hub.graphistry.com/docs/api/2/rest/upload/data/#uploadjson2
 *      // - https://pandas.pydata.org/docs/reference/api/pandas.read_json.html
 *      //
 *      // Also: file_compression, sql_transforms, ...
 *      // https://hub.graphistry.com/docs/api/2/rest/files/
 *      {parser_options: {orient: 'records'}}
 * 
 * );   
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
 * ```
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
        const t0 = Date.now();
        if (!force && this._fileCreated) {
            console.debug('File already created, skipping');
            return this._fileCreated;
        }
        console.debug('Creating file');

        const fileJsonResults = await client.post('api/v2/files/', {file_type: this.fileFormat, ...this.createOpts});
        console.debug('File creation response:', fileJsonResults);
        this._fileCreateResponse = fileJsonResults;
        this._fileID = fileJsonResults.file_id;
        this._fileCreated = !!fileJsonResults.file_id;
        console.debug(`File creation took ${Date.now() - t0}ms; file type: ${this.type}`);
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
        const t0 = Date.now();
        if (!force && this._fileUploaded) {
            return this._fileUploaded;
        }
        this.fillMetadata(this._data, client);
        const results = await client.post(
            `api/v2/upload/files/${this._fileID}${ this.uploadUrlOpts ? `?${this.uploadUrlOpts}` : ''}`,
            this._data
        );
        this._fileUploadResponse = results;
        this._fileUploaded = !!results.is_uploaded;
        console.debug(`File upload took ${Date.now() - t0}ms; file type: ${this.type}`);
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

    private fillMetadata(data: any, client: Client): void {
        if (!data) {
            throw new Error('No data to fill metadata; call setData() first or provide to File constructor');
        }

        if (!data['agent_name']) {
            data['agent_name'] = client.agent;
        }
        if (!data['agent_version']) {
            data['agent_version'] = client.version;
        }
    }

}

////////////////////////////////////////////////////////////////////////////////

/**
 * Helper class for tracking intent when creating a {@link File} object for uploading
 */
export class EdgeFile extends File {
    constructor(data: any = undefined, fileFormat = 'json', name = 'my file', createOpts = {}, urlOpts = '') {
        super(FileType.Edge, data, fileFormat, name, createOpts, urlOpts);
    }
}

/**
 * Helper class for tracking intent when creating a {@link File} object for uploading
 */
export class NodeFile extends File {
    constructor(data: any = undefined, fileFormat = 'json', name = 'my file', createOpts = {}, urlOpts = '') {
        super(FileType.Node, data, fileFormat, name, createOpts, urlOpts);
    }
}