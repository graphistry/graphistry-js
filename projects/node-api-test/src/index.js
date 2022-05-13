import { EdgeFile, NodeFile, Dataset, Client } from '@graphistry/node-api';

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

////////////////////////////////////////////////////////////////////////////////

if (false) {
  
    const client = new Client(user, password);

    const edgesFile = new EdgeFile(edges);
    const nodesFile = new NodeFile(nodes);  // optional
    await Promise.all([edgesFile.upload(client), nodesFile.upload(client)]);

    const dataset = new Dataset({
        node_encodings: { bindings: { node: 'n' } },
        edge_encodings: { bindings: { source: 's', destination: 'd' } },
        metadata: {},
        name: 'testdata',
    }, edgesFile, nodesFile);
    await dataset.upload(client);

    console.info(`View dataset at https://hub.graphistry.com/graph/graph.html?dataset=${dataset.datasetID}`);

} else {

    const client = new Client(user, password);
    const edgesFile = new EdgeFile(edges);
    const nodesFile = new NodeFile(nodes);  // optional

    Promise.all([edgesFile.upload(client), nodesFile.upload(client)])
    .then(() => (new Dataset({
            node_encodings: { bindings: { node: 'n' } },
            edge_encodings: { bindings: { source: 's', destination: 'd' } },
            metadata: {},
            name: 'testdata',
        }, edgesFile, nodesFile)).upload(client))
    .then(dataset => {
        console.info(`View dataset at https://hub.graphistry.com/graph/graph.html?dataset=${dataset.datasetID}`);
        console.info(`Dataset using node file ${nodesFile.fileID}, edge file ${edgesFile.fileID}`);
    })
    .catch(err => {
        console.error('Oops', err);
    });

}