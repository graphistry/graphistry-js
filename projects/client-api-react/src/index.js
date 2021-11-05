import React, { useRef, useState, useEffect, useCallback } from 'react'
import uuidv4 from 'uuid/v4';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';

import { GraphistryJS } from '@graphistry/client-api';
import { bg } from './bg';
import { bindings } from './bindings.js';
import { usePrevious } from './usePrevious';


const { Observable, Subject } = GraphistryJS;
const loadingNavLogoStyle = {
    top: `5px`,
    width: `100%`,
    height: `31px`,
    position: `relative`,
    backgroundSize: `contain`,
    backgroundRepeat: `no-repeat`,
    backgroundPositionX: `calc(100% - 10px)`,
    backgroundImage: `url(${bg})`
};

const propTypes = {

	...(Object.values(bindings).reduce(
			(acc, {name, nameDefault, reactType}) => 
				({	...acc, 
					[name]: reactType,
					...(nameDefault ? {[nameDefault]: reactType} : {}),
				}),
			{})),

    apiKey: PropTypes.string,
    dataset: PropTypes.string,
    graphistryHost: PropTypes.string.isRequired,
    play: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),

    onClientAPIConnected: PropTypes.func,

    nodes: PropTypes.arrayOf([]),

    showInfo: PropTypes.bool,
    showMenu: PropTypes.bool,
    showToolbar: PropTypes.bool,
    showInspector: PropTypes.bool,
    showHistograms: PropTypes.bool,
    showSplashScreen: PropTypes.bool,
    loadingMessage: PropTypes.string,

    containerClassName: PropTypes.string,
    containerStyle: PropTypes.object,
    containerProps: PropTypes.object,
    iframeClassName: PropTypes.string,
    iframeStyle: PropTypes.object,
    iframeProps: PropTypes.object,

    showPointsOfInterest: PropTypes.bool,
    showPointsOfInterestLabels: PropTypes.bool,

    allowFullScreen: PropTypes.bool,
    backgroundColor: PropTypes.string,

    nodes: PropTypes.arrayOf(PropTypes.object),
    edges: PropTypes.arrayOf(PropTypes.object),
    bindings: PropTypes.shape({
        idField:  PropTypes.string.isRequired,
        sourceField: PropTypes.string.isRequired,
        destinationField:  PropTypes.string.isRequired,
    }),

    type: PropTypes.string,
    axes: PropTypes.array,
    controls: PropTypes.string,
    workbook: PropTypes.string,
};

const defaultProps = {
    graphistryHost: 'https://hub.graphistry.com',
    containerClassName: 'graphistry-container',
    containerStyle: {},
    containerProps: {},
    iframeClassName: 'graphistry-iframe',
    iframeStyle: {},
    iframeProps: {},
    allowFullScreen: true,
    backgroundColor: '#333339',
    play: 5,
    showInfo: true,
    showMenu: true,
    showToolbar: true,
    //showInspector: false,
    //showHistograms: false,
    showSplashScreen: false,
    showLoadingIndicator: true,
    loadingMessage: 'Herding stray GPUs',
    //showPointsOfInterest: true,
    //showPointsOfInterestLabels: true,
};

// Post upon fresh data
// dataset, edges, nodes, bindings, prevEdges, prevNodes, prevBindings
// setLoading, setDataset, setLoadingMessage
// apiKey, graphistryHost, vizStyle, vizClassName, allowFullScreen, backgroundColor,
const ETLUploader = (props) => {

    const { dataset, edges, nodes, bindings } =  props;

    const prevEdges = usePrevious(edges);
    const prevNodes = usePrevious(nodes);
    const prevBindings = usePrevious(bindings);

    if (typeof dataset === 'string' || (
        shallowEqual(prevEdges, edges) &&
        shallowEqual(prevNodes, nodes) &&
        shallowEqual(prevBindings, bindings))) {
        console.log('has dataset or unchanged data: no upload');
        return null;
    }

    const { setLoading, setDataset, setLoadingMessage,
            apiKey, graphistryHost = {} } = props;
    if (!edges ||
        !edges.length ||
        !apiKey ||
        !bindings ||
        !bindings.sourceField ||
        !bindings.destinationField || (
            !bindings.idField && nodes && nodes.length)) {
        setLoading(false);
        setDataset(null);
        //TODO is this reachable during progressive rendering?
        console.error('upload missing data, skipping', {
            edges,
            apiKey,
            bindings: { sourceField: bindings.sourceField, destinationField: bindings.destinationField, idField: bindings.idField },
            nodes,
        });
        return null;
    }

    console.log('uploading');
    const type = 'edgelist';
    const name = uuidv4();
    setLoading(true);
    setDataset(null);
    setLoadingMessage('Uploading graph');
    Observable.ajax.post(`${graphistryHost || ''}/etl${''
        }?key=${apiKey
        }&apiversion=1${''
        }&agent=${encodeURIComponent(`'client-api-react'`)}`,
        { type, name, graph: edges, labels: nodes, bindings },
        { 'Content-Type': 'application/json' }
    ).do(({ response }) => {
        if (response && response.success) {
            console.log('response', response);
            setLoading(!props.showSplashScreen)
            return response;
        } else {
            console.error('upload failed', response);
            throw new Error('Error uploading graph');
        }
    })
    .first()
    .subscribe(
        (response) => {
            setLoading(false);
            setDataset(response.dataset);
        },
        (error) => {
            setLoading(false);
            setDataset(null);
            setLoadingMessage('Error uploading graph');
            console.error('error uploading graph', error);
        }
    );

    return null;
};

function handleUpdates({g, isFirstRun, props}) {
    console.log('update any settings')

    const prevState = {};
    const currState = {};
    bindings.forEach(({name}) => {
        const val = props[name];
        currState[name] = val;
        prevState[name] = usePrevious(val);
    });

    useEffect(() => {
        if (isFirstRun) {
            console.log('firstRun; skip updates')
            return;
        }
    
        if (!g || !g.g) {
            console.log('no g; skip updates')
            return;
        }

        const changes = [];        
        const changed = {};
        bindings.forEach(({name, jsName, jsCommand}) => {
            const val = props[name];
            if (prevState[name] !== val) {
                changed[name] = val;
                if (!jsCommand) {
                    changes.push(g.g.updateSetting(jsName, val));
                } else {
                    console.log('pushing update command', {jsCommand, val});
                    changes.push(g.g[jsCommand](val));
                }
            }
        });
        /*
        //TODO
        if (typeof props.workbook !== 'undefined') operations.push(g.saveWorkbook());
        if (typeof props.axes !== 'undefined' && !axesMap.has(props.axes)) {
            axesMap.set(props.axes, true);
            operations.push(g.encodeAxis(props.axes));
        }
        */
        if (changes.length) {
            console.log('dispatched all updating settings', changed);
            Observable
                .merge(...changes)
                .takeLast(1).startWith(null)
                .subscribe(
                    (v) => { console.log('iframe prop change updates', v, changed); },
                    (e) => { console.error('iframe prop change error', e, changed); },
                    () => { console.log('iframe prop change done', changed); }
                );
        } else {
            console.log('no updating settings to dispatch');
        }
    }, [...Object.values(currState), ...Object.values(prevState), g]);
}


// Regenerate on url change
function generateIframeRef({
    setLoading, setLoadingMessage, setG, setGSub, setFirstRun,
    url, dataset, props,
    iframeStyle, iframeClassName, iframeProps, allowFullScreen
}) {
    return useCallback(iframe => {
        if (iframe && dataset) {
            let loaded = false;
            setLoading(true);
            setLoadingMessage('Fetching session');
            console.log('new iframe', typeof(iframe), {iframe, dataset, propsDataset: props.dataset});
            const sub = (new GraphistryJS(iframe))
                .do((g2) => {
                    if (!loaded) {
                        console.log('leading, disable loader!')
                        loaded = true;
                        setG({g: g2});
                        setLoading(false);
                        setLoadingMessage('');
                        setFirstRun(true);
                    } else {
                        console.log('trailing, no loader!')
                    }
                })
                .do((g2) => {
                    const changes = [];        
                    const changed = {};
                    bindings.forEach(({name, jsName, jsCommand}) => {
                        const val = props[name];
                        if (val !== undefined) {
                            console.log('not undefined', {val, jsCommand, jsName});
                            if (!jsCommand) {
                                console.log('pushing init setting', {name, jsName, val});
                                changes.push(g2.updateSetting(jsName, val));
                                changed[name] = val;
                            } else {
                                console.log('pushing init command', {name, jsName, jsCommand, val});
                                changes.push(g2[jsCommand](val));
                            }
                        }
                    });
                    /*
                    //TODO
                    if (typeof props.workbook !== 'undefined') operations.push(g.saveWorkbook());
                    if (typeof props.axes !== 'undefined' && !axesMap.has(props.axes)) {
                        axesMap.set(props.axes, true);
                        operations.push(g.encodeAxis(props.axes));
                    }
                    */
                    Observable
                        .merge(...changes)
                        .takeLast(1).startWith(null)
                        .do(() => {
                            setFirstRun(false);
                        })
                        .subscribe(
                            (v) => { console.log('iframe prop init updates', v, changed); },
                            (e) => { console.error('iframe prop init error', e, changed); },
                            () => {
                                console.log('iframe prop init done', changed);
                            }
                        )
                })
                .do((g2) => {
                    if (props.onClientAPIConnected) {
                        props.onClientAPIConnected.call(undefined, g2);
                    }
                })
                .subscribe(
                    (v) => console.log('sub hit', v),
                    (e) => console.error('sub error', e),
                    () => console.log('sub complete'));
            setGSub(sub);
            return () => {
                // Not called in practice; maybe only if <Graphistry> itself is unmounted?
                console.log('iframe unmounted!', iframe);
                sub.unsubscribe();
            }    
        } else {
            console.log('no iframe', typeof(iframe), {iframe, dataset});
            return () => {};
        }
    }, [
       url,
       iframeStyle, iframeClassName, iframeProps, allowFullScreen
    ]);
}


// iframe refreshes on key arg changes: via <iframe key={f(url)}
// graphistryjs connects on mount, unsubscribes on new graphistry or unmount
function Graphistry(props) {

    const {
        containerStyle, containerClassName, containerProps,
        iframeStyle, iframeClassName, iframeProps,
        allowFullScreen,
        play, showMenu, showInfo, showToolbar,
        showLoadingIndicator, showSplashScreen,
        graphistryHost, type = 'vgraph',
        controls = '', workbook, session,
    } = props;

    const [loading, setLoading] = useState(!!props.loading);
    const [dataset, setDataset] = useState(props.dataset);
    const [loadingMessage, setLoadingMessage] = useState(props.loadingMessage || '');

    const [g, setG] = useState(null);
    const [gSub, setGSub] = useState(null);
    const prevSub = usePrevious(gSub);

    console.log('update any settings')
    const [isFirstRun, setFirstRun] = useState(true);
    handleUpdates({g, isFirstRun, props});


    //props changes override latest etl?
    const prevDataset = usePrevious(props.dataset);
    useEffect(() => {
        if ((prevDataset !== props.dataset) && (props.dataset !== dataset)) {
            setDataset(props.dataset);
        }
    }, [props.dataset, prevDataset, dataset]);

    useEffect(() => {
        if (prevSub != gSub) {
            console.log('iframe sub changed!', prevSub, gSub);
            if (prevSub) {
                console.log('unsubscribing prev iframe g sub');
                prevSub.unsubscribe();
            }
        }
    }, [prevSub, gSub]);

    const playNormalized = typeof play === 'boolean' ? play : (play | 0) * 1000;
    const optionalParams = (type ? `&type=${type}` : ``) +
                           (controls ? `&controls=${controls}` : ``) +
                           (session ? `&session=${session}` : ``) +
                           (workbook ? `&workbook=${workbook}` : ``);

    const url = `${graphistryHost || ''}/graph/graph.html${''
}?play=${playNormalized
}&info=${showInfo
}&splashAfter=${showSplashScreen
}&dataset=${encodeURIComponent(dataset)
}${optionalParams}`;

    //Initial frame load and settings
    const iframeRef = generateIframeRef({
        setLoading, setLoadingMessage, setG, setGSub, setFirstRun,
        url, dataset, props,
        iframeStyle, iframeClassName, iframeProps, allowFullScreen
    });

    const children = [
        <ETLUploader 
            key={'g_etl'}
            {...props}
            {...{setLoading, setDataset, setLoadingMessage}}
        />
    ];

    if (loading && !showSplashScreen) {
        const showHeader = showMenu && showToolbar;
        children.push(
            <div key='graphistry-loading-placeholder'
                 className='graphistry-loading-placeholder'>
                {showHeader &&
                <div className='graphistry-loading-placeholder-nav'>
                    <div style={loadingNavLogoStyle}></div>
                </div> || undefined}
                <div className='graphistry-loading-placeholder-content' style={showHeader ? undefined : { height: `100%` }}>
                    <div className='graphistry-loading-placeholder-message'>
                        {showLoadingIndicator &&
                        <span className='graphistry-loading-placeholder-spinner'/> || undefined}
                        <p>{loadingMessage || ''}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (dataset) {
        console.log('<Graphistry> render iframe', dataset, url);
        children.push(
            <iframe
                    key={`g_iframe_${url}`}
                    ref={iframeRef}
                    scrolling='no'
                    key='vizframe'
                    style={iframeStyle}
                    className={iframeClassName}
                    allowFullScreen={!!allowFullScreen}
                    src={url}
                    {...iframeProps}
            />
        );
    }
    return <div style={containerStyle} className={containerClassName} {...containerProps}>{children}</div>;
}

Graphistry.propTypes = propTypes;
Graphistry.defaultProps = defaultProps;

export { Graphistry, ETLUploader };
