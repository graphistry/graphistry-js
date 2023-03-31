const { EdgeFile, NodeFile, Dataset, Client } = require('@graphistry/node-api');
const { tableFromArrays, tableToIPC } = require('apache-arrow');

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

////////////////////////////////////////////////////////////////////////////////

const user = process.env.GRAPHISTRY_USER;
if (!user) { throw new Error('GRAPHISTRY_USER environment variable not set'); }

const password = process.env.GRAPHISTRY_PASSWORD;
if (!password) { throw new Error('GRAPHISTRY_PASSWORD environment variable not set'); }

const org = process.env.GRAPHISTRY_ORG;

const protocol = process.env.GRAPHISTRY_PROTOCOL || 'https';
const host = process.env.GRAPHISTRY_HOST || 'hub.graphistry.com';

////////////////////////////////////////////////////////////////////////////////

//------------------------------------------------------------------------
async function go() {
//------------------------------------------------------------------------

if (false) {
  
    const client = new Client(user, password, org, protocol, host);

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

    console.info(`View dataset ${dataset.datasetID} at ${dataset.datasetURL}`);
    console.info(`Dataset using node file ${nodesFile.fileID}, edge file ${edgesFile.fileID}`);

} else if (false) {

    const client = new Client(user, password, org, protocol, host);

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

} else if (false) {

    const client = new Client(user, password, org, protocol, host);

    const edgesFile = new EdgeFile(
        edgesRows,
        'json',
        'my_edges',
        //Options: https://hub.graphistry.com/docs/api/2/rest/files/
        {
            description: 'My row-oriented edges json file',
            parser_options: {
                //JSON parsing options:
                // - https://hub.graphistry.com/docs/api/2/rest/upload/data/#uploadjson2
                // - https://pandas.pydata.org/docs/reference/api/pandas.read_json.html
                //Ex: Array of objects
                orient: 'records'
            }
            //also: file_compression, sql_transforms
        });
    const nodesFile = new NodeFile( // optional
        nodesRows, 'json', 'my_nodes',
        {'parser_options': { 'orient': 'records' }}
    ); 

    const dataset = new Dataset(
        {

            node_encodings: {
                //https://hub.graphistry.com/docs/api/2/rest/upload/colors
                bindings: {
                    node: 'n', // id
                    node_title: 'vv'
                    //also: node_color, node_opacity, node_size, node_weight
                },
                //https://hub.graphistry.com/docs/api/2/rest/upload/complex/
                complex: {
                    default: {
                        //https://hub.graphistry.com/docs/api/2/rest/upload/complex/
                        pointColorEncoding: {
                            graphType: "point",
                            encodingType: "color",
                            attribute: "vv",
                            variation: "continuous",
                            colors: ["blue", "yellow", "red"]
                        },
                        //https://hub.graphistry.com/docs/api/2/rest/upload/complex/icons/
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
                        //see also: Sizes, Badges, Axis
                    }
                }
            },
            
            edge_encodings: {
                bindings: {
                    source: 's', destination: 'd'
                    //also: edge_color, edge_opacity, edge_weight
                },
                complex: {
                    default: {
                        ////Icon, color, & badge encodings can be used here too!
                    }
                }
            },

            metadata: {
                //Set brand & theme: Background, foreground, logo, page metadata
                //https://hub.graphistry.com/docs/api/2/rest/upload/metadata/
                bg: {
                    color: 'silver'
                }
            },
            name: 'testdata',
        },
        edgesFile,
        nodesFile,

        //Additional visual and layout settings
        //https://hub.graphistry.com/docs/api/1/rest/url/#urloptions
        {strongGravity: true, edgeCurvature: 0.1, play: 1000}
    );

    await dataset.upload(client);

    console.info(`View dataset ${dataset.datasetID} at ${dataset.datasetURL}`);
    console.info(`Dataset using node file ${nodesFile.fileID}, edge file ${edgesFile.fileID}`);

} else if (false) {

    const client = new Client(user, password, org, protocol, host);
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
        console.info(`View dataset ${dataset.datasetID} at ${dataset.datasetURL}`);
        console.info(`Dataset using node file ${nodesFile.fileID}, edge file ${edgesFile.fileID}`);
    })
    .catch(err => {
        console.error('Oops', err);
    });

} else if (false) {

    //convert edges to apache-arrow table
    const edgesArr = tableFromArrays(edges);
    const nodesArr = tableFromArrays(nodes);
    const client = new Client(user, password, org, protocol, host);

    function arrToUint8Array(arr) {
        const ui8 = tableToIPC(arr, 'file');
        return ui8;
    }

    const edgesFile = new EdgeFile(arrToUint8Array(edgesArr), 'arrow');
    const nodesFile = new NodeFile(arrToUint8Array(nodesArr), 'arrow');  // optional
    await Promise.all([edgesFile.upload(client), nodesFile.upload(client)]);

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

    //convert edges to apache-arrow table
    const edgesArr = tableFromArrays(edges);
    const nodesArr = tableFromArrays(nodes);
    const client = new Client(user, password, org, protocol, host);

    function arrToUint8Array(arr) {
        const ui8 = tableToIPC(arr, 'file');
        return ui8;
    }
    const edgesFile = new EdgeFile(arrToUint8Array(edgesArr), 'arrow');
    const nodesFile = new NodeFile(arrToUint8Array(nodesArr), 'arrow');  // optional
    await Promise.all([edgesFile.upload(client), nodesFile.upload(client)]);

    const dataset = new Dataset({
        node_encodings: { bindings: { node: 'n' } },
        edge_encodings: { bindings: { source: 's', destination: 'd' } },
        metadata: {},
        name: 'testdata',
    }, edgesFile, nodesFile);
    await dataset.upload(client);

    console.info(`View dataset ${dataset.datasetID} at ${dataset.datasetURL}`);
    console.info(`Dataset using node file ${nodesFile.fileID}, edge file ${edgesFile.fileID}`);

    await dataset.privacy(client);

}

//------------------------------------------------------------------------
}
//------------------------------------------------------------------------

go();