# `@graphistry/node-api`: Graphistry's Node.js client API

## Automatically upload and visualize datasets using node, powered by Graphistry's GPU graph visualization infrastructure

### Install

`npm install @graphistry/node-api`

### Usage

#### The many options

The API is split between the client wrapper and the JSON configuration payloads:

* **[@graphistry/nodeAPI API docs](https://graphistry.github.io/graphistry-js/node-tsdocs/)**: Overall Node.js client llibrary
* **[Graphistry REST API](https://hub.graphistry.com/docs/api/)**: JSON payload options around configuring file formats and visualization settings

#### Ex: JavaScript with async/await

```javascript
import { EdgeFile, NodeFile, Dataset, Client } from '@graphistry/node-api';

//defaults: 'https', 'hub.graphistry.com', 'https://hub.graphistry.com'
const client = new Client('my_username', 'my_password');

//columnar data is fastest; column per attribute; reuse across datasets
const edgesFile = new EdgeFile({'s': ['a1', 'b2'], 'd': ['b2', 'c3']});
const nodesFile = new NodeFile({'n': ['a1', 'b2', 'c3'], 'a1': ['x', 'y', 'z']});

const dataset = new Dataset({
    node_encodings: { bindings: { node: 'n' } },
    edge_encodings: { bindings: { source: 's', destination: 'd' } },
    metadata: {},
    name: 'testdata',
}, edgesFile, nodesFile);

await dataset.upload();
console.info(`View at ${dataset.datasetID} at ${dataset.datasetURL}`);
```

### Ex: TypeScript with async/await

Exactly the same!

### Ex: Using promises

```javascript
import { EdgeFile, NodeFile, Dataset, Client } from '@graphistry/node-api';

//defaults: 'https', 'hub.graphistry.com', 'https://hub.graphistry.com'
const client = new Client(user, password);

//columnar data is fastest; column per attribute; reuse across datasets
const edgesFile = new EdgeFile({'s': ['a1', 'b2'], 'd': ['b2', 'c3']});
const nodesFile = new NodeFile({'n': ['a1', 'b2', 'c3'], 'a1': ['x', 'y', 'z']});

(new Dataset({
        node_encodings: { bindings: { node: 'n' } },
        edge_encodings: { bindings: { source: 's', destination: 'd' } },
        metadata: {},
        name: 'testdata',
    }, edgesFile, nodesFile))
.upload(client)
.then(dataset => {
    console.info(`View at ${dataset.datasetID} at ${dataset.datasetURL}`);
})
.catch(err => {
    console.error('Oops', err);
})
```

### Using API Options

* Set parsing options for different `File` formats and shapes

* Configure `Dataset` nodes &amp; edges to use data-driven colors, sizes, icons, and badges using *simple* and *complex* encodings, including both *continuous* and *categorical* mappings

* Theme with custom branding around background &amp; foreground colors, images, logos, titles, and more



```javascript
const client = new Client(user, password, protocol, host);

// Row-oriented data slower to upload but often convenient
const edgesRows = [
    { 's': 'a', 'd': 'b', 'v': 'e1' },
    { 's': 'b', 'd': 'c', 'v': 'e2' },
    { 's': 'c', 'd': 'a', 'v': 'e3' }
];
const nodesRows = [
    { 'n': 'a', 'vv': 10, 't': 'person' },
    { 'n': 'b', 'vv': 20, 't': 'person' },
    { 'n': 'c', 'vv': 30 , 't': 'car' }
];

const edgesFile = new EdgeFile(
    edgesRows, 'json', 'my_edges',
    // Also: file_compression, sql_transforms, ...
    // https://hub.graphistry.com/docs/api/2/rest/files/
    {
        // JSON parsing options:
        // - https://hub.graphistry.com/docs/api/2/rest/upload/data/#uploadjson2
        // - https://pandas.pydata.org/docs/reference/api/pandas.read_json.html
        parser_options: {
            orient: 'records'  // Row-oriented: Array of objects
        }                      // Default: to columnar json - Object of arrays
    }
);

// Node files are optional, mainly for properties
const nodesFile = new NodeFile(nodesRows);

const dataset = new Dataset(
    {

        // Also: color, size, title, icon, badge, axis
        // - https://hub.graphistry.com/docs/api/2/rest/upload/colors
        // - https://hub.graphistry.com/docs/api/2/rest/upload/complex/
        node_encodings: {
            bindings: {
                node: 'n', // id (required)
                node_title: 'vv'
            },
            complex: {
                default: {
                    pointColorEncoding: {
                        graphType: "point",
                        encodingType: "color",
                        attribute: "vv",
                        variation: "continuous",
                        colors: ["blue", "yellow", "red"]
                    },
                    pointIconEncoding: {
                        graphType: "point",
                        encodingType: "icon",
                        attribute: "t",
                        variation: "categorical",
                        mapping: {
                            categorical: {
                                fixed: {
                                    "person": "user",
                                    "car": "car"
                                },
                                other: "question"
                            }
                        }
                    }
                }
            }
        },

        //Also: color, weight, icon, badge, title
        // - https://hub.graphistry.com/docs/api/2/rest/upload/colors
        // - https://hub.graphistry.com/docs/api/2/rest/upload/complex/
        edge_encodings: {
            bindings: {
                source: 's', destination: 'd'
            },
            complex: { }
        },

        // Brand & theme: Background, foreground, logo, page metadata
        // https://hub.graphistry.com/docs/api/2/rest/upload/metadata/
        metadata: {
            bg: {
                color: 'silver'
            },
            logo: {
                "url": "http://a.com/logo.png",
            }
        },
        name: 'testdata',
    },
    edgesFile,
    nodesFile,

    // Visual and layout settings
    // https://hub.graphistry.com/docs/api/1/rest/url/#urloptions
    {
        strongGravity: true,
        edgeCurvature: 0.5
    }
);

await dataset.upload(client);

console.info(`View dataset ${dataset.datasetID} at ${dataset.datasetURL}`);
console.info(`Dataset using node file ${nodesFile.fileID}, edge file ${edgesFile.fileID}`);
```

### Underlying REST API

For further information about authentication, files, and datasets, see the [Graphistry REST API docs](https://hub.graphistry.com/docs/api/).

### TypeScript

Types are already automatically bundled with this module

For source maps, you may want to add `NODE_OPTIONS=--enable-source-maps` to your environment or run node as `node --enable-source-maps`.
