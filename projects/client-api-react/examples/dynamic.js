import React from 'react';
import ReactDOM from 'react-dom';
import {Graphistry} from '@graphistry/client-api-react';
import '@graphistry/client-api-react/assets/index.less';

const container = document.getElementById('__react-content');
container.style['height'] = `400px`;

ReactDOM.render(
    <Graphistry backgroundColor='#fff'
                showSplashScreen={true}
                showPointsOfInterest={false}
                apiKey='<your API Key here>'
                style={{ border: `1px solid #ccc` }}
                graphistryHost='https://labs.graphistry.com'
                nodes={[
                    { nodeId: 'node1', pointTitle: 'Point 1', aNodeField: `I'm a node!`, pointColor: 5 },
                    { nodeId: 'node2', pointTitle: 'Point 2', aNodeField: `I'm a node too!`, pointColor: 4 },
                    { nodeId: 'node3', pointTitle: 'Point 3', aNodeField: `I'm a node three!`, pointColor: 3 }
                ]}
                edges={[
                    { src: 'node1', dst: 'node2', edgeTitle: 'Edge 1', edgeCount: 7, anEdgeField: `I'm an edge!` },
                    { src: 'node3', dst: 'node1', edgeTitle: 'Edge 2', edgeCount: 35, anEdgeField: `I'm another edge!` },
                    { src: 'node2', dst: 'node3', edgeTitle: 'Edge 3', edgeCount: 200, anEdgeField: `I'm also an edge!` }
                ]}
                bindings={{
                    idField: 'nodeId',
                    sourceField: 'src',
                    destinationField: 'dst'
                }}/>,
    container
);
