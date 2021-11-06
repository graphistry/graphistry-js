import React from 'react';
import ReactDOM from 'react-dom';
import { GraphistryJS } from '@graphistry/client-api';

function initializeClientAPI(iframe) {
    if (iframe) {
        GraphistryJS(iframe)
            .do((graphistry) =>
                console.log('hiding points of interest') ||
                graphistry.updateSetting('labelPOI', false))
            .toPromise();
    }
}

const container = document.getElementById('__react-content');
container.style['height'] = `350px`;

ReactDOM.render(
    <iframe key='viz'
            scrolling='no'
            allowFullScreen='true'
            ref={initializeClientAPI}
            src='https://hub.graphistry.com/graph/graph.html?dataset=Miserables&splashAfter=true'
            style={{ width: `100%`, height: `100%`, border: `1px solid #ccc` }}/>,
    container
);
