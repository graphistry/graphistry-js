import React, { useRef, useState, useEffect, useCallback } from 'react'
import shallowEqual from 'shallowequal';

import { bindings } from './bindings.js';
import { GraphistryJS } from '@graphistry/client-api';
import { usePrevious } from './usePrevious';
const { Observable } = GraphistryJS;


function mergeDefaultPropValues(props) {
    return {
        showIcons: props.defaultShowIcons,

        ...(Object.values(bindings).reduce(
            (acc, {name, nameDefault}) => 
                ({  ...acc, 
                    [name]: props[nameDefault]
                }),
            {})),
        
        ...props
    };
}

function applyPropsToClientAPI(iFrameRefHandler) {
    const axesMap = new WeakMap();
    return function applyPropsToClientAPI([g, props]) {
        if (!g) {
            return Observable.of({ ...props, loading: !props.showSplashScreen, iFrameRefHandler });
        }
        const operations = [];

        bindings.forEach(({name, jsName, jsCommand}) => {
            if (typeof props[name] !== 'undefined') {
                if (!jsCommand) {
                    operations.push(g.updateSetting(jsName, props[name]));
                } else {
                    operations.push(g[jsCommand](props[name]));
                }
            }
        });

        if (typeof props.workbook !== 'undefined') operations.push(g.saveWorkbook());
        if (typeof props.axes !== 'undefined' && !axesMap.has(props.axes)) {
            axesMap.set(props.axes, true);
            operations.push(g.encodeAxis(props.axes));
        }

        return Observable
            .merge(...operations)
            .takeLast(1).startWith(null)
            .mapTo({ ...props, loading: false, iFrameRefHandler });
    }
}

function scanClientAPIAndProps(prev, curr) {
    const [prevG] = prev, [currG, props] = curr;
    if (currG && prevG !== currG && typeof props.onClientAPIConnected === 'function') {
        props.onClientAPIConnected.call(undefined, currG);
    }
    return curr;
}

const mapPropsStream = function(p) {
    console.error('mapPropsStream not implemented');
    //throw new Error('mapPropsStream not implemented');
}

const withClientAPI2 = mapPropsStream((propsStream) => {

    const createEventHandler = function (v) { 
        console.error('not implemented createEventHandler');
        throw new Error('not implemented createEventHandler');
    }

    const { handler: iFrameRefHandler, stream: iFrames } = createEventHandler();

    const clientAPIStream = Observable.from(iFrames).startWith(null)
        .switchMap((iFrame) => iFrame ? GraphistryJS(iFrame) : Observable.of(null))
        .distinctUntilChanged();

    const propsStreamWithDefaults = Observable.from(propsStream).publish((xs) =>
        xs.merge(xs.take(1).map(mergeDefaultPropValues))
    ).distinctUntilChanged(shallowEqual);

    const clientAPIAndPropsStream = clientAPIStream
        .combineLatest(propsStreamWithDefaults)
        .scan(scanClientAPIAndProps)

    return clientAPIAndPropsStream
        .switchMap(applyPropsToClientAPI(iFrameRefHandler))
        .distinctUntilChanged(shallowEqual);
});

const ClientAPI = ({iframeRef, ...props}) => {

    const [g, setG] = React.useState(props.g);
    const [iframe, setIframe] = React.useState(iframeRef);
    //const [combinedProps, setCombinedProps] = React.useState(props);

    return null;
};

export { ClientAPI };
export default ClientAPI;