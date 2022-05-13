# Graphistry's node.js client API

## Automatically upload and visualize datasets using node, powered by Graphistry's GPU graph visualization infrastructure

### Install

`npm install @graphistry/node-api`

### Usage

#### Ex: JavaScript with async/await

```javascript
import { EdgeFile, NodeFile, Dataset, Client } from '@graphistry/node-api';

const client = new Client('my_username', 'my_password');
//default URLs: 'https', 'hub.graphistry.com', 'https://hub.graphistry.com'

//columnar data is fastest; column per attribute
const edgesFile = new EdgeFile({'s': ['a1', 'b2'], 'd': ['b2', 'c3']});

//nodes are optional
const nodesFile = new NodeFile({'n': ['a1', 'b2', 'c3'], 'a1': ['x', 'y', 'z']});

//reuse file IDs across multiple datasets: save time & space
await Promise.all([edgesFile.upload(), nodesFile.upload()])

//many options!
const dataset = new Dataset({
    node_encodings: { bindings: { node: 'n' } },
    edge_encodings: { bindings: { source: 's', destination: 'd' } },
    metadata: {},
    name: 'testdata',
}, edgesFile, nodesFile);

await dataset.upload();
console.info(`Created dataset at https://hub.graphistry.com/graph/graph.html?dataset=${dataset.datasetID}`);
```

### Ex: Typescript with async/await

Exactly the same!

### Ex: Using promises

```javascript
import { EdgeFile, NodeFile, Dataset, Client } from '@graphistry/node-api';

const client = new Client(user, password);
const edgesFile = new EdgeFile({'s': ['a1', 'b2'], 'd': ['b2', 'c3']});
const nodesFile = new NodeFile({'n': ['a1', 'b2', 'c3'], 'a1': ['x', 'y', 'z']});

Promise.all([edgesFile.upload(client), nodesFile.upload(client)])
.then(() => (new Dataset({
        node_encodings: { bindings: { node: 'n' } },
        edge_encodings: { bindings: { source: 's', destination: 'd' } },
        metadata: {},
        name: 'testdata',
    }, edgesFile, nodesFile)).upload(client))
.then(dataset => {
    console.info(`View dataset at https://hub.graphistry.com/graph/graph.html?dataset=${dataset.datasetID}`);
})
.catch(err => {
    console.error('Oops', err);
})
```

### Underlying REST API

For further information about authentication, files, and datasets, see the [Graphistry REST API docs](https://hub.graphistry.com/docs/api/).

### Typescript

Types are already automatically bundled with this module

For source maps, you may want to add `NODE_OPTIONS=--enable-source-maps` to your environment or run node as `node --enable-source-maps`.
