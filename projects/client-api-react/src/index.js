import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';


import { graphistryJS, updateSetting, encodeAxis } from '@graphistry/client-api';
import * as gAPI from '@graphistry/client-api';
import { ajax, catchError, first, forkJoin, map, of, switchMap, tap } from '@graphistry/client-api';  // avoid explicit rxjs dep
import { bg } from './bg';
import { bindings, panelNames } from './bindings.js';
import { Client as ClientBase } from '@graphistry/client-api';

export const Client = ClientBase;

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

function panelNameToPropName(panelName) {
    return `togglePane${panelName[0].toUpperCase()}${panelName.slice(1)}`;
}

const propTypes = {

    ...(Object.values(bindings).reduce(
        (acc, { name, nameDefault, reactType }) =>
        ({
            ...acc,
            [name]: reactType,
            ...(nameDefault ? { [nameDefault]: reactType } : {}),
        }),
        {})),

    //FIXME: https://github.com/storybookjs/storybook/issues/14092  
    //togglePanel: PropTypes.oneOf(panelNames.concat([false])),
    togglePanel: PropTypes.oneOf(['filters', 'exclusions', 'scene', 'labels', 'layout', false]),

    /*
    * @deprecated apiKey will be replaced with JWT-based methods
    */
    apiKey: PropTypes.string,

    dataset: PropTypes.string,
    graphistryHost: PropTypes.string.isRequired,
    play: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),

    onClientAPIConnected: PropTypes.func,

    showInfo: PropTypes.bool,
    showMenu: PropTypes.bool,
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
        idField: PropTypes.string.isRequired,
        sourceField: PropTypes.string.isRequired,
        destinationField: PropTypes.string.isRequired,
    }),

    type: PropTypes.string,
    axes: PropTypes.array,
    controls: PropTypes.string,
    workbook: PropTypes.string,

    ticks: PropTypes.number,

    tolerateLoadErrors: PropTypes.bool
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
    showSplashScreen: false,
    showLoadingIndicator: true,
    loadingMessage: 'Herding stray GPUs',
    tolerateLoadErrors: true
};

// Post upon fresh data
// dataset, edges, nodes, bindings, prevEdges, prevNodes, prevBindings
// setLoading, setDataset, setLoadingMessage
// apiKey, graphistryHost, vizStyle, vizClassName, allowFullScreen, backgroundColor,
const ETLUploader = (props) => {

    console.warn('ETLUploader will be switching to JWT based methods');

    const {
        dataset, edges, nodes, bindings,
        setLoading, setDataset, setLoadingMessage,
        apiKey, graphistryHost
    } = props;

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
        console.debug('we should not be here');
        const name = uuidv4("uuidpatch" + Math.random());
        console.debug('clientapi react uuid4', { name });
        const payload = { type, name, graph: edges, labels: nodes, bindings };
        const url = `${graphistryHost || ''}/etl${''
            }?key=${apiKey
            }&apiversion=1${''
            }&agent=${encodeURIComponent(`'client-api-react'`)}`
        console.debug('uploading', url, payload);
        const sub = ajax({
            url,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        })
            .pipe(
                tap(({ response }) => {
                    if (response && response.success) {
                        console.debug('upload response', response);
                        setLoading(!props.showSplashScreen)
                        return response;
                    } else {
                        console.error('upload failed', response);
                        throw new Error('Error uploading graph');
                    }
                }),
                first()
            )
            .subscribe({
                next(response) {
                    setLoading(false);
                    setDataset(response.dataset);
                },
                error(error) {
                    setLoading(false);
                    setDataset(null);
                    setLoadingMessage('Error uploading graph');
                    console.error('error uploading graph', error);
                }
            });

        return () => {
            console.debug('unsubscribing upload', { url, payload, sub });
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


function catchGError({ tolerateLoadErrors, g, msg, payload }) {
    return catchError(err => {
        console.error(msg, payload, err);
        if (tolerateLoadErrors) {
            return of(g.updateStateWithResult({ msg, err }));
        }
        throw err;
    });
}


function propsToCommands({ g, props, prevState, axesMap, tolerateLoadErrors }) {

    const commands = {};
    bindings.forEach(({ name, jsName, jsCommand }) => {
        const val = props[name];
        if (prevState[name] !== val) {
            if (jsCommand) {
                console.debug('js cmd', jsCommand);
                if (!gAPI[jsCommand]) {
                    throw new Error(`Resolved operator ${jsCommand} not in GraphistryJS; GraphistryJS<>GraphistryReac version mismatch?`);
                }

            }
            commands[name] =
                of(g).pipe(
                    !jsCommand ? updateSetting(jsName, val) : gAPI[jsCommand](val),
                    catchGError({
                        tolerateLoadErrors,
                        g,
                        msg: `Error running GraphistryJS command`,
                        payload: { g, name, jsName, jsCommand, val, tolerateLoadErrors }
                    }));
        }
    });
    if (props.axes && !axesMap.has(props.axes)) {
        axesMap.set(props.axes, true);
        commands['axes'] = of(g).pipe(encodeAxis(props.axes));
    }

    const enabledPanels = [];
    const disabledPanels = [];
    if (prevState.togglePanel !== props.togglePanel) {
        if (props.togglePanel !== undefined && props.togglePanel !== false && props.togglePanel !== 'false') {
            if (panelNames.indexOf(props.togglePanel) !== -1) {
                enabledPanels.push(props.togglePanel);
            } else {
                console.warn('Unknown togglePanel', { togglePane: props.togglePanel });
            }
        } else {
            disabledPanels.push(props.togglePanel);
        }
    }
    if (enabledPanels.length || disabledPanels.length) {
        const isEnabling = !!enabledPanels.length;
        const panelName = isEnabling ? enabledPanels[0] : disabledPanels[0];
        const propName = panelNameToPropName(panelName);
        commands[propName] =
            of(g).pipe(
                gAPI.togglePanel(panelName, isEnabling),
                catchGError({
                    tolerateLoadErrors,
                    g,
                    msg: `Error toggling panel`,
                    payload: { g, panelName, propName, props, tolerateLoadErrors }
                }));
    }
    console.debug('togglePanel', { togglePanel: props.togglePanel, enabledPanels, disabledPanels, commands });


    /*
    //TODO
    if (typeof props.workbook !== 'undefined') commands['saveWorkbook'] = saveWorkbook();
    */
    console.debug('commands', commands);
    return commands;
}

function handleUpdates({ g, isFirstRun, axesMap, props }) {
    const prevState = {};
    const currState = {};
    bindings.forEach(({ name }) => {
        const val = props[name];
        currState[name] = val;
        prevState[name] = usePrevious(val);
    });
    panelNames.forEach(panelName => {
        const propName = panelNameToPropName(panelName);
        const val = props[propName];
        currState[propName] = val;
        prevState[propName] = usePrevious(val);
    });
    const currTogglePanel = props.togglePanel;
    currState.togglePanel = currTogglePanel;
    prevState.togglePanel = usePrevious(currTogglePanel);

    useEffect(() => {
        console.debug('update any settings', !isFirstRun && g && g.g, { isFirstRun, readyG: g && g.g, props, prevState, currState });

        if (isFirstRun) {
            console.log('firstRun; skip updates')
            return;
        } else if (!g) {
            console.log('no g; skip updates')
            return;
        }

        const commands = propsToCommands({ g, props, prevState, axesMap });

        if (Object.keys(commands).length) {
            console.debug('dispatched all updating settings', commands);
            const sub = forkJoin(commands)
                .subscribe({
                    error(e) { console.error('iframe prop change error', e, commands); },
                    complete() { console.debug('iframe prop change done', commands); }
                });
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
    iframeStyle, iframeClassName, iframeProps, allowFullScreen,
    tolerateLoadErrors
}) {

    console.debug('@generateIframeRef', { url, dataset, props, axesMap, iframeStyle, iframeClassName, iframeProps, allowFullScreen, tolerateLoadErrors });

    return useCallback(iframe => {
        if (iframe && dataset) {
            console.debug('@generateIframeRef callback', { iframe, dataset });
            let loaded = false;
            setLoading(true);
            setLoadingMessage('Fetching session');
            console.debug('new iframe', typeof (iframe), { iframe, dataset, propsDataset: props.dataset });
            const sub = (graphistryJS(iframe))
                .pipe(
                    tap(g => { console.debug('new graphistryJS', g); }),
                    switchMap(
                        (g) => of(g).pipe(
                            tap((g) => {
                                console.debug('new graphistryJS2', g);
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
                                console.debug('new graphistryJS3', g);
                                const commands = propsToCommands({ g, props, prevState: {}, axesMap, tolerateLoadErrors });
                                if (Object.keys(commands).length) {
                                    console.debug('created all iframe init settings commands', commands);
                                    return forkJoin(commands)
                                        .pipe(
                                            tap((hits) => { console.debug('new iframe commands all returned', { hits }); }),
                                            map(hits => g.updateStateWithResult(hits)))
                                }
                                console.debug('new iframe with no commands');
                                return of(g.updateStateWithResult([]))
                            }),
                            catchError(exn => {
                                console.error('error in iframe initialization', exn);
                                return of(g.updateStateWithResult(exn));
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
                .subscribe({
                    next(v) { console.debug('iframe init sub hit', v); },
                    error(e) { console.error('iframe init sub error', e); },
                    complete() { console.debug('iframe init sub complete'); }
                });
            setGSub(sub);
            return () => {
                // Not called in practice; maybe only if <Graphistry> itself is unmounted?
                console.debug('iframe unmounted!', iframe);
                sub.unsubscribe();
            }
        } else {
            console.debug('no iframe', typeof (iframe), { iframe, dataset });
            return () => { };
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
        tolerateLoadErrors
    } = props;

    const [loading, setLoading] = useState(!!props.loading);
    const [dataset, setDataset] = useState(props.dataset);
    const [loadingMessage, setLoadingMessage] = useState(props.loadingMessage || '');

    const [g, setG] = useState(null);
    const [gSub, setGSub] = useState(null);
    const prevSub = usePrevious(gSub);

    const [axesMap] = useState(new WeakMap());

    const [isFirstRun, setFirstRun] = useState(true);
    handleUpdates({ g, isFirstRun, axesMap, props });

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
        iframeStyle, iframeClassName, iframeProps, allowFullScreen,
        tolerateLoadErrors
    });

    const children = [
        <ETLUploader
            key={`g_etl_${props.key}`}
            {...props}
            {...{ setLoading, setDataset, setLoadingMessage }}
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
                            <span className='graphistry-loading-placeholder-spinner' /> || undefined}
                        <p>{loadingMessage || ''}</p>
                    </div>
                </div>
            </div>
        );
    }
    children.push(<div>
        hello
    </div>)
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
