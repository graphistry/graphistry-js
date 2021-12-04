import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';
import uuidv4 from 'uuid/v4';

import { graphistryJS, updateSetting, encodeAxis } from '@graphistry/client-api';
import * as gAPI from '@graphistry/client-api';
import { ajax, catchError, forkJoin, map, of, switchMap, tap } from '@graphistry/client-api';  // avoid explicit rxjs dep
import { bg } from './bg';
import { bindings } from './bindings.js';

//https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

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

    //ticks
    ticks: PropTypes.number
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

    const {
        dataset, edges, nodes, bindings,
        setLoading, setDataset, setLoadingMessage,
        apiKey, graphistryHost
    } =  props;

    const prevEdges = usePrevious(edges);
    const prevNodes = usePrevious(nodes);
    const prevBindings = usePrevious(bindings);

    const hasDatasetOrUnchangedGraph = typeof dataset === 'string' || (
        shallowEqual(prevEdges, edges) &&
        shallowEqual(prevNodes, nodes) &&
        shallowEqual(prevBindings, bindings));

    const lacksGraphConfig = !edges ||
        !edges.length ||
        !apiKey ||
        !bindings ||
        !bindings.sourceField ||
        !bindings.destinationField || (
            !bindings.idField && nodes && nodes.length);

    useEffect(() => {
        if (hasDatasetOrUnchangedGraph) {
            return;
        }
        if (lacksGraphConfig) {
            setLoading(false);
            setDataset(null);
            return;
        }

        setLoading(true);
        setDataset(null);
        setLoadingMessage('Uploading graph');
 
        const type = 'edgelist';
        const name = uuidv4();
        const payload = { type, name, graph: edges, labels: nodes, bindings };
        const url = `${graphistryHost || ''}/etl${''
    }?key=${apiKey
    }&apiversion=1${''
    }&agent=${encodeURIComponent(`'client-api-react'`)}`
        console.debug('uploading', url, payload);
        const sub = ajax({
                url,
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: payload
            })
            .do(({ response }) => {
                if (response && response.success) {
                    console.debug('upload response', response);
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

        return () => {
            console.debug('unsubscribing upload', {url, payload, sub});
            sub.unsubscribe();
        }

    }, [
        dataset, edges, nodes, bindings,
        prevEdges, prevNodes, prevBindings,
        apiKey, graphistryHost,
        setLoading, setDataset, setLoadingMessage,
    ]);

    return null;
};


function propsToCommands({g, props, prevState, axesMap}) {
    const commands = {};
    bindings.forEach(({name, jsName, jsCommand}) => {
        const val = props[name];
        if (prevState[name] !== val) {
            if (jsCommand) {
                console.debug('js cmd', jsCommand);
                if (!gAPI[jsCommand]) {
                    throw new Error(`Resolved operator ${jsCommand} not in GraphistryJS; GraphistryJS<>GraphistryReac version mismatch?`);
                }

            }
            commands[name] = of(g).pipe(!jsCommand ? updateSetting(jsName, val) : gAPI[jsCommand](val));
        }
    });
    if (props.axes && !axesMap.has(props.axes)) {
        axesMap.set(props.axes, true);
        commands['axes'] = of(g).pipe(encodeAxis(props.axes));
    }
    /*
    //TODO
    if (typeof props.workbook !== 'undefined') commands['saveWorkbook'] = saveWorkbook();
    */
    console.debug('commands', commands);
    return commands;
}

function handleUpdates({g, isFirstRun, axesMap, props}) {
    const prevState = {};
    const currState = {};
    bindings.forEach(({name}) => {
        const val = props[name];
        currState[name] = val;
        prevState[name] = usePrevious(val);
    });

    useEffect(() => {
        console.debug('update any settings', !isFirstRun && g && g.g, {isFirstRun, readyG: g && g.g, props, prevState, currState});

        if (isFirstRun) {
            console.log('firstRun; skip updates')
            return;
        } else if (!g) {
            console.log('no g; skip updates')
            return;
        }

        const commands = propsToCommands({g, props, prevState, axesMap});

        if (Object.keys(commands).length) {
            console.debug('dispatched all updating settings', commands);
            const sub = forkJoin(commands)
                .subscribe(
                    () => { },
                    (e) => { console.error('iframe prop change error', e, commands); },
                    () => { console.debug('iframe prop change done', commands); }
                );
            return () => {
                sub.unsubscribe();
            }
        } else {
            console.debug('no changes to settings', prevState, currState, commands);
        }
    }, [
        ...Object.values(currState),
        ...Object.values(prevState),
        g
    ]);
}


// Regenerate on url change
function generateIframeRef({
    setLoading, setLoadingMessage, setG, setGSub, setFirstRun,
    url, dataset, props,
    axesMap,
    iframeStyle, iframeClassName, iframeProps, allowFullScreen
}) {
    return useCallback(iframe => {
        if (iframe && dataset) {
            let loaded = false;
            setLoading(true);
            setLoadingMessage('Fetching session');
            console.info('new iframe', typeof(iframe), {iframe, dataset, propsDataset: props.dataset});
            const sub = (graphistryJS(iframe))
                .pipe(
                    switchMap(
                        (g) => of(g).pipe(
                            tap((g) => {
                                if (!loaded) {
                                    console.debug('iframe loader taking over', g)
                                    loaded = true;
                                    setG(g);
                                    setLoading(false);
                                    setLoadingMessage('');
                                    setFirstRun(true);
                                } else {
                                    console.debug('iframe init not ready yet', g)
                                }
                            }),
                            switchMap((g) => {
                                const commands = propsToCommands({g, props, prevState: {}, axesMap});
                                if (Object.keys(commands).length) {
                                    console.debug('created all iframe init settings commands', commands);
                                    return forkJoin(commands)
                                        .pipe(
                                            tap((hits) => { console.debug('new iframe commands all returned', {hits} ); }),
                                            map(hits => g.updateStateWithResult(hits)))
                                }
                                console.debug('new iframe with no commands');
                                return of(g.updateStateWithResult([]))
                            }),
                            catchError(exn => {
                                console.error('error in iframe initialization', exn);
                                return g.updateStateWithResult(exn);
                            }))),
                    tap((g) => {
                        console.debug('new iframe all init updates handled, if any', g);
                        setFirstRun(false);
                        if (props.onClientAPIConnected) {
                            console.debug('has onClientAPIConnected(), calling', props.onClientAPIConnected);
                            props.onClientAPIConnected(g);
                        }
                    }),
                )
                .subscribe(
                    (v) => console.debug('iframe init sub hit', v),
                    (e) => console.error('iframe init sub error', e),
                    () => console.debug('iframe init sub complete'));
            setGSub(sub);
            return () => {
                // Not called in practice; maybe only if <Graphistry> itself is unmounted?
                console.debug('iframe unmounted!', iframe);
                sub.unsubscribe();
            }    
        } else {
            console.debug('no iframe', typeof(iframe), {iframe, dataset});
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

    const [axesMap] = useState(new WeakMap());

    const [isFirstRun, setFirstRun] = useState(true);
    handleUpdates({g, isFirstRun, axesMap, props});

    //props changes override latest etl
    const prevDataset = usePrevious(props.dataset);
    useEffect(() => {
        if ((prevDataset !== props.dataset) && (props.dataset !== dataset)) {
            setDataset(props.dataset);
        }
    }, [props.dataset, prevDataset, dataset]);

    useEffect(() => {
        if ((prevSub != gSub) && prevSub) {
            console.debug('unsubscribing prev iframe g sub');
            prevSub.unsubscribe();
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
        axesMap,
        iframeStyle, iframeClassName, iframeProps, allowFullScreen
    });

    const children = [
        <ETLUploader 
            key={`g_etl_${props.key}`}
            {...props}
            {...{setLoading, setDataset, setLoadingMessage}}
        />
    ];

    if (loading && !showSplashScreen) {
        const showHeader = showMenu && showToolbar;
        children.push(
            <div key={`graphistry-loading-placeholder-${props.key}`}
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
        children.push(
            <iframe
                    key={`g_iframe_${url}_${props.key}`}
                    ref={iframeRef}
                    scrolling='no'
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
