import shallowEqual from 'recompose/shallowEqual';
import mapPropsStream from 'recompose/mapPropsStream';
import createEventHandler from 'recompose/createEventHandler';
import { GraphistryJS } from '@graphistry/client-api';
const { Observable } = GraphistryJS;

import { bindings } from './bindings.js';


function mergeDefaultPropValues(props) {
    console.log('react merge', props, bindings);
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
    return function applyPropsToClientAPI([g, props]) {
        if (!g) {
            return Observable.of({ ...props, loading: !props.showSplashScreen, iFrameRefHandler });
        }
        const operations = [];

        bindings.forEach( ({name, jsName, jsCommand}) => {
            if (typeof props[name] !== 'undefined') {
                if (!jsCommand) {
                    operations.push(g.updateSetting(jsName, props[name]));
                }
            } else {
                operations.push(g[jsCommand](props[name]));
            }

        });

        if (typeof props.axes                 !== 'undefined') operations.push(g.encodeAxis(props.axes));
        if (typeof props.workbook             !== 'undefined') operations.push(g.saveWorkbook());

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

const withClientAPI = mapPropsStream((propsStream) => {

    const { handler: iFrameRefHandler, stream: iFrames } = createEventHandler();

    const clientAPIStream = Observable.from(iFrames).startWith(null)
        .switchMap((iFrame) => iFrame ? GraphistryJS(iFrame) : Observable.of(null))
        .distinctUntilChanged();

    const propsStreamWithDefaults = Observable.from(propsStream).publish((xs) =>
        xs.merge(xs.take(1).map(mergeDefaultPropValues)));

    const clientAPIAndPropsStream = clientAPIStream
        .combineLatest(propsStreamWithDefaults)
        .scan(scanClientAPIAndProps)

    return clientAPIAndPropsStream
        .switchMap(applyPropsToClientAPI(iFrameRefHandler))
        .distinctUntilChanged(shallowEqual);
});

export { withClientAPI };
export default withClientAPI;