import PropTypes from 'prop-types';


const bindingsTable = {
	
    background:             [ PropTypes.string,      'defaultBackground',         undefined,      undefined],
    labelOpacity:           [ PropTypes.number,      'defaultLabelOpacity',       undefined,      undefined],
    labelColor:             [ PropTypes.string,      'defaultLabelColor',         undefined,      undefined],
    labelBackground:        [ PropTypes.string,      'defaultLabelBackground',    undefined,      undefined],
    pointSize:				[ PropTypes.number,      'defaultPointSize',          undefined,      undefined],
    edgeCurvature:          [ PropTypes.number,      'defaultEdgeCurvature',      undefined,      undefined],
    edgeOpacity:			[ PropTypes.number,      'defaultEdgeOpacity',        undefined,      undefined],
    pointOpacity:			[ PropTypes.number,      'defaultPointOpacity',       undefined,      undefined],
    showArrows:				[ PropTypes.bool,        'defaultShowArrows',         undefined,      undefined],
    showLabels:				[ PropTypes.bool,        'defaultShowLabels',         'labelEnabled', undefined],
    showToolbar:			[ PropTypes.bool,        'defaultShowToolbar',        undefined,      undefined],
    showInspector:			[ PropTypes.bool,        'defaultShowInspector',      undefined,      'toggleInspector'],
    showHistograms:			[ PropTypes.bool,        'defaultShowHistograms',     undefined,      'toggleHistograms'],
    pruneOrphans:			[ PropTypes.bool,        'defaultPruneOrphans',       undefined,      undefined],
    showLabelOnHover:		[ PropTypes.bool,        'defaultShowLabelOnHover',   'labelHighlightEnabled',   undefined],
	showLabelPropertiesOnHover: [ PropTypes.bool, 'defaultShowLabelPropertiesOnHover', 'labelPropertiesEnabled',   undefined],
    showPointsOfInterest:	[ PropTypes.bool,   'defaultShowPointsOfInterest',    'labelPOI',      undefined],
    pointsOfInterestMax:	[ PropTypes.number,  'defaultPointsOfInterestMax',    'labelPOIMax',  undefined],
    linLog:					[ PropTypes.bool,        'defaultLinLog',             undefined,      undefined],
    lockedX:				[ PropTypes.bool,        'defaultLockedX',            undefined,      undefined],
    lockedY:				[ PropTypes.bool,        'defaultLockedY',            undefined,      undefined],
    strongGravity:			[ PropTypes.bool,        'defaultStrongGravity',      undefined,      undefined],
    dissuadeHubs:			[ PropTypes.bool,        'defaultDissuadeHubs',       undefined,      undefined],
    edgeInfluence:			[ PropTypes.oneOf([ 0, 1, 2, 3, 4, 5]), 'defaultEdgeInfluence',    undefined,  undefined],
    precisionVsSpeed:		[ PropTypes.oneOf([ -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]), 'defaultPrecisionVsSpeed',   undefined,  undefined],
    gravity:				[ PropTypes.oneOf(Array.from({ length: 100 }, (x, i) => i + 1)), 'defaultGravity',  undefined,  undefined],
    scalingRatio:			[ PropTypes.oneOf(Array.from({ length: 100 }, (x, i) => i + 1)), 'defaultScalingRatio', undefined,  undefined]

};


//[ {name: String, nameDefault: String, reactType: PropType, jsName: String, jsCommand: ?String} ]
export const bindings = 
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