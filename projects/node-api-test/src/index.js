import { File, FileType, Dataset, Client } from '@graphistry/node-api';

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

const client = new Client(user, password);

const edgesFile = new File(FileType.Edge, edges);
await edgesFile.createFile(client);
await edgesFile.uploadData(client);

//optional
const nodesFile = new File(FileType.Node, nodes);
await nodesFile.createFile(client);
await nodesFile.uploadData(client);

const dataset = Dataset({
    node_encodings: {
        bindings: {
            node: 'n'
        }
    },
    edge_encodings: {
        bindings: {
            source: 's',
            destination: 'd'
        }
    },
    metadata: {},
    name: 'testdata',
});
dataset.addFile(edgesFile);
dataset.addFile(nodesFile);

const datasetID = await dataset.getGraphUrl(client);
console.log(`Dataset ID: ${datasetID}`);
