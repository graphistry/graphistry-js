/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from './Client';
import { File, FileType } from './File';

export class Dataset {

    private _nodeFiles: File[];
    private _edgeFiles: File[];

    private _bindings: Record<string, unknown>;
    private _datasetID?: string;

    constructor(bindings: Record<string, unknown> = {}) {
        this._bindings = bindings;
        this._nodeFiles = [];
        this._edgeFiles = [];
    }

    public async getGraphUrl(client: Client): Promise<string> {
        
        await Promise.all(
            this._nodeFiles.concat(this._edgeFiles).map(async (file) => {
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
        
        const fileBindings = {
            node_files: this._nodeFiles.map((file) => file.fileID),
            edge_files: this._edgeFiles.map((file) => file.fileID),
        };
        const bindings = { ...fileBindings, ...this._bindings };

        return await this.createDataSet(client, bindings);
    }

    public async createDataSet(client: Client, data: Record<string, unknown>): Promise<string> {
        const dataJsonResults = await client.post('api/v2/upload/datasets/', data);
        const datasetID = dataJsonResults.data.dataset_id;
        this._datasetID = datasetID;
        return datasetID;
    }

    public addBindings(bindings: Record<string, unknown>): void {
        this._bindings = bindings;
    }

    public addFile(file: File) {
        if (file.type === FileType.Node) {
            this._nodeFiles.push(file);
        } else if (file.type === FileType.Edge) {
            this._edgeFiles.push(file);
        } else {
            throw new Error('Invalid File Type');
        }
    }
}