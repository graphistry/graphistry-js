import React, { useRef, useState, useEffect, useCallback } from 'react'
import uuidv4 from 'uuid/v4';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';

import { GraphistryJS } from '@graphistry/client-api';
import { ClientAPI } from './withClientAPI';
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
    showLogo: PropTypes.bool,
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
    //showInfo: true,
    //showMenu: true,
    //showLogo: true,
    //showToolbar: true,
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

    const prevDataset = usePrevious(dataset);
    const prevEdges = usePrevious(edges);
    const prevNodes = usePrevious(nodes);
    const prevBindings = usePrevious(bindings);

    const keysThatCanTriggerReRender = [
        'dataset', 'graphistryHost',
        'loading', 'loadingMessage',
    ];

    if (typeof dataset === 'string' || (
        shallowEqual(prevEdges, edges) &&
        shallowEqual(prevNodes, nodes) &&
        shallowEqual(prevBindings, bindings))) {
        return null;
    }

    const { setLoading, setDataset, setLoadingMessage } = props;
    const { apiKey, graphistryHost = {} } = props;
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

// iframe refreshes on key arg changes: via <iframe key={f(url)}
// graphistryjs connects on mount, unsubscribes on new graphistry or unmount
function Graphistry(props) {

    const {
        containerStyle, containerClassName, containerProps,
        iframeStyle, iframeClassName, iframeProps,
        allowFullScreen,
        play, showMenu = true, showLogo = true, showInfo = true, showToolbar = true,
        showLoadingIndicator = true, showSplashScreen = false,
        backgroundColor, graphistryHost, type = 'vgraph',
        controls = '', workbook, session,
    } = props;

    console.log('Graphistry', {graphistryHost, dataset, dataset: props.dataset})
    const [loading, setLoading] = useState(!!props.loading);
    const [dataset, setDataset] = useState(props.dataset);
    const [loadingMessage, setLoadingMessage] = useState(props.loadingMessage || '');

    console.log('g state');
    const [g, setG] = useState(null);
    console.log('gSub state');
    const [gSub, setGSub] = useState(null);
    const prevG = usePrevious(g);
    const prevSub = usePrevious(gSub);

    const prevState = {};
    const currState = {};
    //const setters = {};
    bindings.forEach(({name, jsName, jsCommand}) => {
        const val = props[name];
        //const [ val, setter ]= useState(props[name]);
        //setters[name] = setter;
        currState[name] = val;
        prevState[name] = usePrevious(val);
    });

    console.log('update any settings')
    const [isFirstRun, setFirstRun] = useState(true);
    useEffect(() => {
        if (!g || !g.g) {
            console.log('no g yet');
            return;
        } else {
            console.log('has g', g);
        }
        if (isFirstRun) {
            console.log('firstRun; skip updates')
            return;
        }
        const changes = [];        
        const changed = {};
        bindings.forEach(({name, jsName, jsCommand}) => {
            //const val = currState[name];
            const val = props[name];
            if (prevState[name] !== val) {
                console.log('delta', {prev: prevState[name], val, jsCommand, jsName});
                if (!jsCommand) {
                    console.log('pushing settings command', {name, jsName, val});
                    changes.push(g.g.updateSetting(jsName, val));
                    changed[name] = val;
                } else {
                    console.log('pushing special command', {name, jsName, jsCommand, val});
                    changes.push(g.g[jsCommand](val));
                }
            }
            Observable
                .merge(...changes)
                .takeLast(1).startWith(null)
                .subscribe(
                    (v) => { console.log('iframe prop change updates', v, changed); },
                    (e) => { console.error('iframe prop change error', e, changed); },
                    () => { console.log('iframe prop change done', changed); }
                )
        });
    }, [...Object.values(currState), ...Object.values(prevState), g]);

    const prevDataset = usePrevious(props.dataset);
    if ((prevDataset !== props.dataset) && (props.dataset !== dataset)) {
        setLoading(true);
        setLoadingMessage('Fetching session');
        setDataset(props.dataset);
    }

    //Initial frame load and settings
    const iframeRef = useCallback(iframe => {
        if (iframe) {
            let loaded = false;
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
                        //const val = currState[name];
                        const val = props[name];
                        if (val !== undefined) {
                            console.log('not undefined', {val, jsCommand, jsName});
                            if (!jsCommand) {
                                console.log('pushing init command', {name, jsName, val});
                                changes.push(g2.updateSetting(jsName, val));
                                changed[name] = val;
                            } else {
                                console.log('pushing init command', {name, jsName, jsCommand, val});
                                changes.push(g2[jsCommand](val));
                            }
                        }
                    });
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
                .subscribe(
                (v) => console.log('sub hit', v),
                (e) => console.error('sub error', e),
                () => console.log('sub complete'));
            setGSub(sub);
        } else {
            console.log('no iframe', typeof(iframe), {iframe, dataset});
        }
        return () => {
            // Not called in practice; maybe only if <Graphistry> itself is unmounted?
            console.log('iframe unmounted!', iframe);
            sub.unsubscribe();
        }
    }, [
        dataset, props.dataset, prevDataset,
        graphistryHost
    ]);

    const prevIframeRef = usePrevious(iframeRef);
    useEffect(() => {        
        if (prevSub != gSub) {
            console.log('iframe sub changed!', prevSub, gSub);
            if (prevSub) {
                console.log('unsubscribing prev iframe g sub');
                prevSub.unsubscribe();
            }
        }
    }, [iframeRef, prevIframeRef, g, prevG, prevSub]);



    const children = [
        <ETLUploader 
            key={'g_etl'}
            {...props}
            {...{setLoading, setDataset, setLoadingMessage}}
        />
    ];

    if (loading) {
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
        const playNormalized = typeof play === 'boolean' ? play : (play | 0) * 1000;
        const optionalParams = (type ? `&type=${type}` : ``) +
                               (controls ? `&controls=${controls}` : ``) +
                               (session ? `&session=${session}` : ``) +
                               (workbook ? `&workbook=${workbook}` : ``);
        console.log('<Graphistry> render iframe');
        const url = `${graphistryHost || ''}/graph/graph.html${''
    }?play=${playNormalized
    }&info=${!!showInfo
    }&splashAfter=${!!showSplashScreen
    }&dataset=${encodeURIComponent(dataset)
    }&logo=${showLogo}${optionalParams}`;
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
        children.push(<ClientAPI
            key={'g_client'}
            iframeRef={iframeRef}
            {...props}
            {...{setLoading, setDataset, setLoadingMessage}}
        />);
    }
    return <div style={containerStyle} className={containerClassName} {...containerProps}>{children}</div>;
}

//Graphistry = withClientAPI(handleETLUpload(Graphistry));

Graphistry.propTypes = propTypes;
Graphistry.defaultProps = defaultProps;

export { Graphistry, ETLUploader };
