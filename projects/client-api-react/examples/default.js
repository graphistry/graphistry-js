import React from 'react';
import ReactDOM from 'react-dom';
import {Graphistry} from '@graphistry/client-api-react';
import '@graphistry/client-api-react/assets/index.less';

const container = document.getElementById('__react-content');
container.style['height'] = `400px`;

ReactDOM.render(
    <Graphistry play={5}
                showInfo={false}
                pruneOrphans={true}
                showSplashScreen={true}
                dataset='Miserables'
                backgroundColor='#fff'
                precisionVsSpeed={-2}
                showPointsOfInterest={false}
                style={{ border: `1px solid #ccc` }}
                graphistryHost='https://labs.graphistry.com'/>,
    container
);
