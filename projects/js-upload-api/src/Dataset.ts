/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from './Client.js';
import { File, FileType, EdgeFile, NodeFile } from './File.js';

/**
 * # Dataset examples
 * 
 * Datasets are how to combine files into a single visualizable graph.
 * Powerfully, you can also specify visualization settings and 
 * data-driven visual encodings as part of your dataset's bindings.
 * 
 * For the many options, see the [JSON documentation](https://hub.graphistry.com/docs/api/).
 * 
 * <br>
 * 
 * ---
 * 
 * <br>
 * 
 * @example **Create a dataset from edges and upload using async/await**
 * ```javascript
 * import { Dataset } from '@graphistry/node-api';
 * const dataset = new Dataset(
 *   {
 *       node_encodings: { bindings: { } },
 *       edge_encodings: { bindings: { source: 's', destination: 'd' } },
 *       metadata: {},
 *       name: 'testdata',
 *   },
 *   edgesFile
 * );
 * await dataset.upload(client);
 * console.log(`Dataset ${dataset.datasetID} uploaded to ${dataset.datasetURL}`);
 * ```
 * 
 * <br>
 * 
 * @example **Create a dataset from nodes + edges and upload using promises**
 * ```javascript
 * import { Dataset } from '@graphistry/node-api';
 * const dataset = new Dataset(
 *   {
 *       node_encodings: { bindings: { 'node': 'n' } },
 *       edge_encodings: { bindings: { 'source': 's', 'destination': 'd' } },
 *       metadata: {},
 *       name: 'testdata',
 *   },
 *   edgesFile,
 *   nodesFile
 * );
 * dataset.upload(client).then(
 *   () => console.log(`Dataset ${dataset.datasetID} uploaded to ${dataset.datasetURL}`)
 * ).catch(err => console.error('oops', err));
 * ```
 * 
 * <br>
 * 
 * @example **Add files after the Dataset is instantiated but before it has been uploaded**
 * ```javascript
 * import { Dataset } from '@graphistry/node-api';
 * const dataset = new Dataset(
 *   {
 *       node_encodings: { bindings: { 'node': 'n' } },
 *       edge_encodings: { bindings: { 'source': 's', 'destination': 'd' } },
 *       metadata: {},
 *       name: 'testdata',
 *   }
 * );
 * dataset.addFile(nodesFile);
 * dataset.addFile(edgesFile);
 * await dataset.upload(client);
 * console.log(`Dataset ${dataset.datasetID} uploaded to ${dataset.datasetURL}`);
 * ```
 * 
 * <br>
 * 
 * @example **Set simple data-driven bindings for titles, colors, icons, and labels**
 * ```javascript
 * import { Dataset } from '@graphistry/node-api';
 * const dataset = new Dataset(
 *   {
 * 
 *       // See also simple title, color, ... and complex color, size, icon, badge, ...
 *       // https://hub.graphistry.com/docs/api/2/rest/upload/colors
 *       // https://hub.graphistry.com/docs/api/2/rest/upload/complex/
 *       node_encodings: {
 * 
 *          bindings: {
 *              'node': 'n', //id 
 *              'node_title': 'some_title_column' //optional
 *          },
 * 
 *          complex: {
 *             default: {
 *               pointSizeEncoding: {
 *                  graphType: 'point',
 *                  encodingType: 'size',
 *                  attribute: 'payment',
 *                  variation: 'categorical',
 *                  mapping: {
 *                      fixed: {
 *                          big: 500,
 *                          normal: 200,
 *                          tiny: 10 
 *                      },
 *                      other: 100
 *                  }
 *               }
 *             }
 *          }
 *       },
 * 
 *       // See also simple title, color, ... and complex color, size, icon, badge, ...
 *       // https://hub.graphistry.com/docs/api/2/rest/upload/colors
 *       // https://hub.graphistry.com/docs/api/2/rest/upload/complex/
 *       edge_encodings: {
 *
 *          bindings: {
 *              'source': 's', 'destination': 'd'
 *          },
 *
 *          complex: {
 *              default: {
 *                 edgeColorEncoding: {
 *                       graphType: 'point',
 *                       encodingType: 'color',
 *                       attribute: 'time',
 *                       variation: 'continuous',
 *                       colors: ['blue', 'yellow', 'red']
 *                 }
 *              }
 *          }
 *       },
 * 
 *       // Set brand & theme: Background, foreground, logo, page metadata
 *       // https://hub.graphistry.com/docs/api/2/rest/upload/metadata/
 *       metadata: {
 *           bg: {
 *               color: 'silver'
 *           },
 *           "logo": {
 *               url: "http://a.com/logo.png",
 *           }
 *       },
 *       name: 'testdata',
 *   },
 * 
 *   nodesFile,
 *   edgesFile
 * 
 *   // Visual and layout settings
 *   // https://hub.graphistry.com/docs/api/1/rest/url/#urloptions
 *   {
 *       strongGravity: true,
 *       edgeCurvature: 0.5
 *   }
 *
 * );
 * await dataset.upload();
 * ```
 */
export class Dataset {

    ////////////////////////////////////////////////////////////////////////////////


    // Set at start or via managed APIs
    public readonly edgeFiles: EdgeFile[];
    public readonly nodeFiles: NodeFile[];
    public readonly bindings: Record<string, unknown>;
    public readonly urlOpts: Record<string, unknown>;

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
        const xtra = Object.keys(this.urlOpts).length 
            ? `&${Object.keys(this.urlOpts).map(k => `${k}=${this.urlOpts[k]}`).join('&')}`
            : '';
        return `${this._usedClientProtocolHostname}/graph/graph.html?dataset=${this._datasetID}${xtra}`;
    }
    
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * See examples at top of file
     * 
     * Dataset definitions including required node_encodings, edge_encodings, metadata and name.
     * Optional definitions include edge_hypergraph_transform, and description, and various subfields.
     * URL settings may also be specified for additional styling.
     * This method autopopulates definitions edge_files, and if provided, node_files.
     * 
     * Node files are optional: Nodes will be synthesized based on edges if not provided.
     * 
     * If files have not been uploaded yet, this method will upload them for you.
     * 
     * For more information about bindings, see https://hub.graphistry.com/docs/api/2/rest/upload/
     * 
     * For more information about URL style settings, see https://hub.graphistry.com/docs/api/1/rest/url/#urloptions 
     * 
     * For more information about theming, see https://hub.graphistry.com/docs/api/2/rest/upload/metadata/
     *
     * For more information on simple encodings, see https://hub.graphistry.com/docs/api/2/rest/upload/colors
     * 
     * For more information on complex encodings, see https://hub.graphistry.com/docs/api/2/rest/upload/complex/
     * 
     * @param bindings JSON dictionary of bindings
     * @param nodeFiles File object(s)
     * @param edgeFiles File object(s)
     * @param urlOpts JSON dictionary of URL options
     */
    constructor(
        bindings: Record<string, unknown> = {},
        edgeFiles: EdgeFile[] | EdgeFile = [],
        nodeFiles: NodeFile[] | NodeFile = [],
        urlOpts: Record<string, unknown> = {}
    ) {
        this.bindings = bindings;
        this.edgeFiles = edgeFiles instanceof EdgeFile ? [edgeFiles] : edgeFiles;
        this.nodeFiles = nodeFiles instanceof NodeFile ? [nodeFiles] : nodeFiles;
        this.urlOpts = urlOpts;

        console.debug('Dataset constructor', this, { bindings, edgeFiles, nodeFiles, urlOpts });

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

    /**
     * 
     * See examples at top of file
     * 
     * Upload the dataset to the Graphistry server.
     * 
     * If files have not been uploaded yet, this method will upload them for you.
     * 
     * Upon completion, attributes datasetID and datasetURL will be set, as well as
     * createDatasetResponse and uploadResponse.
     * 
     * @param client Client object
     * @returns Promise that resolves when the dataset is uploaded
     */
    public async upload(client: Client): Promise<Dataset> {

        if (!client) {
            throw new Error('No client provided');
        }

        if (!client.isServerConfigured()) {
            throw new Error('Client is not configured');
        }
        console.debug('Uploading dataset', {nodeFiles: this.nodeFiles, edgeFiles: this.edgeFiles});

        //create+upload files as needed
        await Promise.all(
            this.nodeFiles.concat(this.edgeFiles).map(async (file) => {
                console.debug('Uploading file', file);
                const response = await file.createFile(client);
                console.debug(`Uploaded ${file.fileFormat} file`);
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
        this.fillMetadata(bindings, client);
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

    /**
     * Add one or more bindings to the existing ones. In case of conflicts, override the existing ones.
     * 
     * For more information about each, see https://hub.graphistry.com/docs/api/2/rest/upload/
     * 
     * @param bindings JSON dictionary of bindings to be added to the existing ones
     */
    public updateBindings(bindings: Record<string, unknown>): void {
        for (const [key, value] of Object.entries(bindings)) {
            this.bindings[key] = value;
        }
    }

    /**
     *
     * See examples at top of file
     * 
     * Add an additional node or edge file to the existing ones.
     * 
     * @param file File object. Does not need to be uploaded yet.
     * 
    **/
    public addFile(file: File): void {
        console.debug('Adding file', file);
        if (file.type === FileType.Node) {
            this.nodeFiles.push(file);
        } else if (file.type === FileType.Edge) {
            this.edgeFiles.push(file);
        } else {
            throw new Error('Invalid File Type');
        }
    }

    ///////////////////////////////////////////////////////////////////////////////

    private fillMetadata(data: any, client: Client): void{
        if (!data) {
            throw new Error('No data to fill metadata; call setData() first or provide to File constructor');
        }

        if (!data['metadata']) {
            data['metadata'] = {};
        }

        const metadata = data['metadata'];

        if (!metadata['agent']) {
            metadata['agent'] = client.agent;
        }
        if (!metadata['agentversion']) {
            metadata['agentversion'] = client.version;
        }
        if (!metadata['apiversion']) {
            metadata['apiversion'] = '3';
        }
    }
    
}