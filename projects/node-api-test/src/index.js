import { EdgeFile, NodeFile, Dataset, Client } from '@graphistry/node-api';
import { tableFromArrays, tableToIPC } from 'apache-arrow';

////////////////////////////////////////////////////////////////////////////////

const edges = {
    's': ['a', 'b', 'c'],
    'd': ['b', 'c', 'a'],
    'v': ['e1', 'e2', 'e3']
};

//optional
const nodes = {
    'n': ['a', 'b', 'c'],
    'vv': ['aa', 'bb', 'cc']
};

////////////////////////////////////////////////////////////////////////////////

const user = process.env.GRAPHISTRY_USER;
if (!user) { throw new Error('GRAPHISTRY_USER environment variable not set'); }

const password = process.env.GRAPHISTRY_PASSWORD;
if (!password) { throw new Error('GRAPHISTRY_PASSWORD environment variable not set'); }

const protocol = process.env.GRAPHISTRY_PROTOCOL || 'https';
const host = process.env.GRAPHISTRY_HOST || 'hub.graphistry.com';

////////////////////////////////////////////////////////////////////////////////

if (false) {
  
    const client = new Client(user, password, protocol, host);

    const edgesFile = new EdgeFile(edges);
    const nodesFile = new NodeFile(nodes);  // optional
    await Promise.all([edgesFile.uploadUrlOpts(client), nodesFile.uploadUrlOpts(client)]);

    const dataset = new Dataset({
        node_encodings: { bindings: { node: 'n' } },
        edge_encodings: { bindings: { source: 's', destination: 'd' } },
        metadata: {},
        name: 'testdata',
    }, edgesFile, nodesFile);
    await dataset.upload(client);

    console.info(`View dataset ${dataset.datasetID} at ${dataset.datasetURL}`);
    console.info(`Dataset using node file ${nodesFile.fileID}, edge file ${edgesFile.fileID}`);

} else if (true) {

    const client = new Client(user, password, protocol, host);

    const edgesFile = new EdgeFile(edges);
    const nodesFile = new NodeFile(nodes);  // optional

    const dataset = new Dataset({
        node_encodings: { bindings: { node: 'n' } },
        edge_encodings: { bindings: { source: 's', destination: 'd' } },
        metadata: {},
        name: 'testdata',
    }, edgesFile, nodesFile);
    await dataset.upload(client);

    console.info(`View dataset ${dataset.datasetID} at ${dataset.datasetURL}`);
    console.info(`Dataset using node file ${nodesFile.fileID}, edge file ${edgesFile.fileID}`);

} else {

    const client = new Client(user, password, protocol, host);
    const edgesFile = new EdgeFile(edges);
    const nodesFile = new NodeFile(nodes);  // optional

    Promise.all([edgesFile.uploadUrlOpts(client), nodesFile.uploadUrlOpts(client)])
    .then(() => (new Dataset({
            node_encodings: { bindings: { node: 'n' } },
            edge_encodings: { bindings: { source: 's', destination: 'd' } },
            metadata: {},
            name: 'testdata',
        }, edgesFile, nodesFile)).upload(client))
    .then(dataset => {
        console.info(`View dataset ${dataset.datasetID} at ${dataset.datasetURL}`);
        console.info(`Dataset using node file ${nodesFile.fileID}, edge file ${edgesFile.fileID}`);
    })
    .catch(err => {
        console.error('Oops', err);
    });

}