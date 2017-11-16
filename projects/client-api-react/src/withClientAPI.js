import shallowEqual from 'recompose/shallowEqual';
import mapPropsStream from 'recompose/mapPropsStream';
import createEventHandler from 'recompose/createEventHandler';
import { GraphistryJS } from '@graphistry/client-api';
const { Observable } = GraphistryJS;

function mergeDefaultPropValues(props) {
    return {
        pointSize: props.defaultPointSize,
        edgeOpacity: props.defaultEdgeOpacity,
        pointOpacity: props.defaultPointOpacity,
        showIcons: props.defaultShowIcons,
        showArrows: props.defaultShowArrows,
        showLabels: props.defaultShowLabels,
        showToolbar: props.defaultShowToolbar,
        showInspector: props.defaultShowInspector,
        showHistograms: props.defaultShowHistograms,
        pruneOrphans: props.defaultPruneOrphans,
        showLabelOnHover: props.defaultShowLabelOnHover,
        showPointsOfInterest: props.defaultShowPointsOfInterest,
        linLog: props.defaultLinLog,
        lockedX: props.defaultLockedX,
        lockedY: props.defaultLockedY,
        strongGravity: props.defaultStrongGravity,
        dissuadeHubs: props.defaultDissuadeHubs,
        edgeInfluence: props.defaultEdgeInfluence,
        precisionVsSpeed: props.defaultPrecisionVsSpeed,
        gravity: props.defaultGravity,
        scalingRatio: props.defaultScalingRatio,
        ...props
    };
}

function applyPropsToClientAPI(iFrameRefHandler) {
    return function applyPropsToClientAPI([g, props]) {
        if (!g) {
            return Observable.of({ ...props, loading: !props.showSplashScreen, iFrameRefHandler });
        }
        const operations = [];

        if (typeof props.pointSize            !== 'undefined') operations.push(g.updateSetting('pointSize', props.pointSize));
        if (typeof props.edgeOpacity          !== 'undefined') operations.push(g.updateSetting('edgeOpacity', props.edgeOpacity));
        if (typeof props.pointOpacity         !== 'undefined') operations.push(g.updateSetting('pointOpacity', props.pointOpacity));
        if (typeof props.showArrows           !== 'undefined') operations.push(g.updateSetting('showArrows', props.showArrows));
        if (typeof props.showLabels           !== 'undefined') operations.push(g.updateSetting('labelEnabled', props.showLabels));
        if (typeof props.showToolbar          !== 'undefined') operations.push(g.updateSetting('showToolbar', props.showToolbar));
        if (typeof props.showInspector        !== 'undefined') operations.push(g.toggleInspector(props.showInspector));
        if (typeof props.showHistograms       !== 'undefined') operations.push(g.toggleHistograms(props.showHistograms));
        if (typeof props.pruneOrphans         !== 'undefined') operations.push(g.updateSetting('pruneOrphans', props.pruneOrphans));
        if (typeof props.showLabelOnHover     !== 'undefined') operations.push(g.updateSetting('labelHighlightEnabled', props.showLabelOnHover));
        if (typeof props.showPointsOfInterest !== 'undefined') operations.push(g.updateSetting('labelPOI', props.showPointsOfInterest));
        if (typeof props.linLog               !== 'undefined') operations.push(g.updateSetting('linLog', props.linLog));
        if (typeof props.lockedX              !== 'undefined') operations.push(g.updateSetting('lockedX', props.lockedX));
        if (typeof props.lockedY              !== 'undefined') operations.push(g.updateSetting('lockedY', props.lockedY));
        if (typeof props.strongGravity        !== 'undefined') operations.push(g.updateSetting('strongGravity', props.strongGravity));
        if (typeof props.dissuadeHubs         !== 'undefined') operations.push(g.updateSetting('dissuadeHubs', props.dissuadeHubs));
        if (typeof props.edgeInfluence        !== 'undefined') operations.push(g.updateSetting('edgeInfluence', props.edgeInfluence));
        if (typeof props.precisionVsSpeed     !== 'undefined') operations.push(g.updateSetting('precisionVsSpeed', props.precisionVsSpeed));
        if (typeof props.gravity              !== 'undefined') operations.push(g.updateSetting('gravity', props.gravity));
        if (typeof props.scalingRatio         !== 'undefined') operations.push(g.updateSetting('scalingRatio', props.scalingRatio));
        if (typeof props.axes                 !== 'undefined') operations.push(g.encodeAxis(props.axes));

        function setEncoding(name, ...args) {
            return g.defer(() => g[name](...args).do({
                next(x) { console.log(`set encoding ${name}`); },
                error(e) { console.log(`${name} failed, retrying`); }
            })).retry();
        }

        ['point', 'edge'].forEach((graphType) => {
            ['', 'Default'].forEach((suffix) => {
                const prop = props[`${graphType}IconEncoding${suffix}`];
                if (typeof prop !== 'undefined') {
                    const { attribute, mapping } = prop;
                    operations.push(setEncoding(`encode${suffix}Icons`, graphType, attribute, mapping));
                } else {
                    operations.push(setEncoding(`encode${suffix}Icons`, graphType));
                }
            });
        });

        ['point', 'edge'].forEach((graphType) => {
            ['', 'Default'].forEach((suffix) => {
                const prop = props[`${graphType}SizeEncoding${suffix}`];
                if (typeof prop !== 'undefined') {
                    const { attribute, mapping } = prop;
                    operations.push(setEncoding(`encode${suffix}Size`, graphType, attribute, mapping));
                } else {
                    operations.push(setEncoding(`encode${suffix}Size`, graphType));
                }
            });
        });

        ['point', 'edge'].forEach((graphType) => {
            ['', 'Default'].forEach((suffix) => {
                const prop = props[`${graphType}ColorEncoding${suffix}`];
                if (typeof prop !== 'undefined') {
                    const { attribute, variation, mapping } = prop;
                    operations.push(setEncoding(`encode${suffix}Color`, graphType, attribute, variation, mapping));
                } else {
                    operations.push(setEncoding(`encode${suffix}Color`, graphType));
                }
            });
        });



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