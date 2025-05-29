import PropTypes from 'prop-types';

//FIXME https://github.com/storybookjs/storybook/issues/14092
//See corresponding issue in index.js
const panelNames = ['filters', 'exclusions', 'scene', 'labels', 'layout'];

// react prop name :: [ react type, default name, maybe alt JS updateSetting prop, maybe alt JS method ]
const bindingsTable = {
	
    backgroundColor:        [ PropTypes.string,      'defaultBackgroundColor',    'background',   undefined],
    labelOpacity:           [ PropTypes.number,      'defaultLabelOpacity',       undefined,      undefined],
    labelColor:             [ PropTypes.string,      'defaultLabelColor',         undefined,      undefined],
    labelBackground:        [ PropTypes.string,      'defaultLabelBackground',    undefined,      undefined],
    pointSize:				[ PropTypes.number,      'defaultPointSize',          undefined,      undefined],
    pointStrokeWidth:		[ PropTypes.number,      'defaultPointStrokeWidth',   undefined,      undefined],
    neighborhoodHighlight:  [ PropTypes.string,      'defaultNeighborhoodHighlight', undefined,   undefined],
    neighborhoodHighlightHops:  [ PropTypes.number,      'defaultNeighborhoodHighlightHops', undefined, undefined],
    edgeCurvature:          [ PropTypes.number,      'defaultEdgeCurvature',      undefined,      undefined],
    edgeOpacity:			[ PropTypes.number,      'defaultEdgeOpacity',        undefined,      undefined],
    pointOpacity:			[ PropTypes.number,      'defaultPointOpacity',       undefined,      undefined],
    showArrows:				[ PropTypes.bool,        'defaultShowArrows',         undefined,      undefined],
    showCollections:		[ PropTypes.bool,        'defaultShowCollections',    undefined,      undefined],
    showLabels:				[ PropTypes.bool,        'defaultShowLabels',         'labelEnabled', undefined],
    showToolbar:			[ PropTypes.bool,        'defaultShowToolbar',        undefined,      undefined],
    showInspector:			[ PropTypes.bool,        'defaultShowInspector',      undefined,      'toggleInspector'],
    showTimebars:			[ PropTypes.bool,        'defaultShowTimebars',       undefined,      'toggleTimebars'],
    showHistograms:			[ PropTypes.bool,        'defaultShowHistograms',     undefined,      'toggleHistograms'],
    pruneOrphans:			[ PropTypes.bool,        'defaultPruneOrphans',       undefined,      undefined],
    showLabelOnHover:		[ PropTypes.bool,        'defaultShowLabelOnHover',   'labelHighlightEnabled',   undefined],
	showLabelPropertiesOnHover: [ PropTypes.bool, 'defaultShowLabelPropertiesOnHover', 'labelPropertiesEnabled',   undefined],
    showLabelInspector:          [ PropTypes.bool,        'defaultShowLabelInspector',     'labelInspectorEnabled',      undefined],
    showLabelActions:       [ PropTypes.bool,        'defaultShowLabelActions',   'labelShowActions', undefined],
    showPointsOfInterest:	[ PropTypes.bool,   'defaultShowPointsOfInterest',    'labelPOI',      undefined],
    showPointsOfInterestLabel:   [ PropTypes.bool,   'defaultShowPointsOfInterestLabel',    'labelLabelPOI',      undefined],
    pointsOfInterestMax:	[ PropTypes.number,  'defaultPointsOfInterestMax',    'labelPOIMax',  undefined],
    linLog:					[ PropTypes.bool,        'defaultLinLog',             undefined,      undefined],
    lockedX:				[ PropTypes.bool,        'defaultLockedX',            undefined,      undefined],
    lockedY:				[ PropTypes.bool,        'defaultLockedY',            undefined,      undefined],
    lockedR:                [ PropTypes.bool,        'defaultLockedR',            undefined,      undefined],
    strongGravity:			[ PropTypes.bool,        'defaultStrongGravity',      undefined,      undefined],
    dissuadeHubs:			[ PropTypes.bool,        'defaultDissuadeHubs',       undefined,      undefined],
    edgeInfluence:			[ PropTypes.oneOf([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 'defaultEdgeInfluence',    undefined,  undefined],
    precisionVsSpeed:		[ PropTypes.oneOf([ -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]), 'defaultPrecisionVsSpeed',   undefined,  undefined],
    gravity:				[ PropTypes.oneOf(Array.from({ length: 100 }, (x, i) => i + 1)), 'defaultGravity',  undefined,  undefined],
    scalingRatio:			[ PropTypes.oneOf(Array.from({ length: 100 }, (x, i) => i + 1)), 'defaultScalingRatio', undefined,  undefined],

    setTogglePanel:            [ PropTypes.array,       undefined,                   undefined,      'togglePanel'],
    
    ticks:                  [PropTypes.number,       undefined,                   undefined,      'tickClustering'],

    filters:             [PropTypes.arrayOf(PropTypes.string), undefined,      undefined,      'addFilters'],
    filter:              [PropTypes.string,       undefined,                   undefined,      'addFilter'],
    exclusions:          [PropTypes.arrayOf(PropTypes.string), undefined,      undefined,      'addExclusions'],
    exclusion:           [PropTypes.string,       undefined,                   undefined,      'addExclusion'],

    encodePointSize: [
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array,
        ]),
        'encodeDefaultPointSize',
        undefined,
        'encodePointSize'
    ],

    encodePointColor: [
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array
        ]),
        'encodeDefaultPointColor',
        undefined,
        'encodePointColor'
    ],
    encodeEdgeColor: [
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array
        ]),
        'encodeDefaultEdgeColor',
        undefined,
        'encodeEdgeColor'
    ],

    encodeAxis: [
        PropTypes.object,
        undefined,
        undefined,
        'encodeAxis'
    ],

    encodePointIcons:  [
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array
        ]),
        'encodeDefaultPointIcons',
        undefined,
        'encodePointIcons'
    ],
    encodeEdgeIcons:  [
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array
        ]),
        'encodeDefaultEdgeIcons',
        undefined,
        'encodeEdgeIcons'
    ],
};


//[ {name: String, nameDefault: String, reactType: PropType, jsName: String, jsCommand: ?String} ]
const bindings = 
    Object.keys(bindingsTable).map( name => {
        const [ reactType, nameDefault, jsName, jsCommand ] = bindingsTable[name];
        return {
            name,
            nameDefault,
            reactType,
            jsName: jsName || name,
            jsCommand
        };
    });

// TODO: infer this from chainList in client-api
const calls = bindings.map(b => b.jsCommand).filter(Boolean).concat([
    'setSelectionExternal',
    'setHighlightExternal'
])

export { bindings, panelNames, calls };