/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from './Client.js';
import { File, FileType, EdgeFile, NodeFile } from './File.js';
import { version } from './version.js';

export class Dataset {

    ////////////////////////////////////////////////////////////////////////////////


    // Set at start or via managed APIs
    public readonly edgeFiles: EdgeFile[];
    public readonly nodeFiles: NodeFile[];
    public readonly bindings: Record<string, unknown>;

    // Set after upload
    private _datasetID?: string;
    public get datasetID(): string | undefined { return this._datasetID; }

    private _createDatasetResponse: any;
    public getCreateDatasetResponse(): any { return this._createDatasetResponse; }

    ////////////////////////////////////////////////////////////////////////////////

    private _usedClientProtocolHostname?: string;
    public get datasetURL(): string {
        if (!this._datasetID) {
            throw new Error('No dataset ID yet');
        }
        if (!this._usedClientProtocolHostname) {
            throw new Error('No client protocol hostname yet');
        }
        return `${this._usedClientProtocolHostname}/graph/graph.html?dataset=${this._datasetID}`;
    }
    
    ////////////////////////////////////////////////////////////////////////////////

    constructor(
        bindings: Record<string, unknown> = {},
        edgeFiles: EdgeFile[] | EdgeFile = [],
        nodeFiles: NodeFile[] | NodeFile = []
    ) {
        this.bindings = bindings;
        this.edgeFiles = edgeFiles instanceof EdgeFile ? [edgeFiles] : edgeFiles;
        this.nodeFiles = nodeFiles instanceof NodeFile ? [nodeFiles] : nodeFiles;

        for (const edgeFile of this.edgeFiles) {
            if (!edgeFile.fileFormat) {
                throw new Error('Edge file must have a fileType');
            }
        }
        for (const nodeFile of this.nodeFiles) {
            if (!nodeFile.fileFormat) {
                throw new Error('Node file must have a fileType');
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////

    public async upload(client: Client): Promise<Dataset> {

        if (!client) {
            throw new Error('No client provided');
        }
        
        //create+upload files as needed
        await Promise.all(
            this.nodeFiles.concat(this.edgeFiles).map(async (file) => {
                const response = await file.createFile(client);
                if (!response) {
                    throw new Error('File creation failed 1');
                }
                const ok = await file.uploadData(client);
                if (!ok) {
                    throw new Error('File upload failed 2');
                }
                return file;
            }));
        
        //upload dataset and get its ID
        const fileBindings = {
            node_files: this.nodeFiles.map((file) => file.fileID),
            edge_files: this.edgeFiles.map((file) => file.fileID),
        };
        const bindings = { ...fileBindings, ...this.bindings };
        await this.createDataset(client, bindings);

        return this;
    }

    ////////////////////////////////////////////////////////////////////////////////

    private async createDataset(client: Client, bindings: Record<string, unknown>): Promise<string> {
        this.fillMetadata(bindings);
        const dataJsonResults = await client.post('api/v2/upload/datasets/', bindings);
        this._createDatasetResponse = dataJsonResults;
        const datasetID = dataJsonResults.data.dataset_id;
        this._datasetID = datasetID;
        this._usedClientProtocolHostname = client.clientProtocolHostname;
        if (!datasetID) {
            throw new Error('Unexpected dataset response, check dataset._createDatasetResponse');
        }
        return datasetID;
    }

    public updateBindings(bindings: Record<string, unknown>): void {
        for (const [key, value] of Object.entries(bindings)) {
            this.bindings[key] = value;
        }
    }

    public addFile(file: File): void {
        if (file.type === FileType.Node) {
            this.nodeFiles.push(file);
        } else if (file.type === FileType.Edge) {
            this.edgeFiles.push(file);
        } else {
            throw new Error('Invalid File Type');
        }
    }

    ///////////////////////////////////////////////////////////////////////////////

    private fillMetadata(data: any): void {
        if (!data) {
            throw new Error('No data to fill metadata; call setData() first or provide to File constructor');
        }

        if (!data['metadata']) {
            data['metadata'] = {};
        }

        const metadata = data['metadata'];

        if (!metadata['agent']) {
            metadata['agent'] = '@graphistry/node-api';
        }
        if (!metadata['agentversion']) {
            metadata['agentversion'] = version;
        }
        if (!metadata['apiversion']) {
            metadata['apiversion'] = '3';
        }
    }
    
}