import React, { useState } from 'react';
import '../../assets/index.css';

import { Graphistry } from '../index';

export default {
  title: 'Graphistry: React style',
  component: Graphistry
};

//no default args
export const Empty = (args) => <Graphistry {...args} />;
export const PredefinedDataset = (args) => <Graphistry {...args} dataset='Miserables' showSplashScreen={true} />;

const defaultSettings = {
  // graphistryHost: "http://0.0.0.0:3000",
  dataset: 'Miserables',
  play: 1,
  showSplashScreen: true,
  // session: "cycle"
};

export const NoSplashScreen = (args) => <Graphistry {...defaultSettings} {...args} showSplashScreen={false} />;

export const OnClientAPIConnected = (args) => {

  const [ loaded, setLoaded ] = useState(false);
  
  return (<div>
    { loaded ? '...loaded!' : 'not loaded...'}
    <Graphistry {...defaultSettings}
      {...args}
      onClientAPIConnected={ () => { setLoaded(true); } }
    />
  </div>);
}

export const OnSelectionUpdate = (args) => {
  const [ selection, setSelection ] = useState(undefined);
  
  return (<div>
    { `Selection: ${JSON.stringify(selection)}`}
    <Graphistry {...defaultSettings}
      {...args}
      onSelectionUpdate={setSelection}
      onLabelsUpdate={undefined}
    />
  </div>);
}

export const OnLabelUpdate = (args) => {
  const [ labels, setLabels ] = useState(undefined);
  
  return (<div>
    { `Labels: ${JSON.stringify(labels)}`}
    <Graphistry {...defaultSettings}
      {...args}
      onSelectionUpdate={undefined} // Otherwise storybook seems to auto set this.
      onLabelsUpdate={setLabels}
    />
  </div>);
}


export const NoClusteringOnLoad = (args) => <Graphistry {...defaultSettings} {...args} play={0} />;
export const OneSecondClusteringOnLoad = (args) => <Graphistry {...defaultSettings} {...args} play={1} />;
export const CustomContainerStyleAndSize = (args) => <Graphistry {...defaultSettings} {...args}
  containerStyle= {{
      'width': '100px',
      'height': '100px',
      'backgroundColor': 'red',
      'border': '4px dotted blue'
    }}
    containerClassName=''
    iframeClassName=''
    iframeStyle={{
      'width': '100%',
      'height': '100%',
      'border': 'none'
    }}
/>;

export const BackgroundColor = (args) => <Graphistry {...defaultSettings}
    backgroundColor= '#f0f0f0'
    {...args}
/>;

export const LabelStyle = (args) => <Graphistry {...defaultSettings}
    labelOpacity={0.5}
    labelColor='magenta'
    labelBackground='#ffffff'
    {...args}
/>;

export const PointStyle = (args) => <Graphistry {...defaultSettings}
    pointSize={10}
    pointOpacity={0.5}
    {...args}
/>;

export const EdgeStyle = (args) => <Graphistry {...defaultSettings}
    edgeCurvature={0.5}
    edgeOpacity={0.5}
    showArrows={false}
    {...args}
/>;

export const NeighborhoodHighlightStyle = (args) => <Graphistry {...defaultSettings}
  neighborhoodHighlight={'incoming'}
  neighborhoodHighlightHos={2}
  {...args}
/>;

export const HoverPropertiesInsteadOfInspector = (args) => <Graphistry {...defaultSettings}
    showLabelPropertiesOnHover={true}
    {...args}
/>;

export const LabelsWithoutProperties = (args) => <Graphistry {...defaultSettings}
    showLabelInspector={false}
    {...args}
/>;

export const LabelsWithoutActions = (args) => <Graphistry {...defaultSettings}
    showLabelActions={false}
    {...args}
/>;

export const LabelsOnlyOnHover = (args) => <Graphistry {...defaultSettings}
    showPointsOfInterest={false}
    {...args}
/>;

export const PointsOfInterestWithoutTextLabel = (args) => <Graphistry {...defaultSettings}
    showPointsOfInterestLabels={false}
    {...args}
/>;

export const ManyPointsOfInterest = (args) => <Graphistry {...defaultSettings}
  pointsOfInterestMax={50}
  {...args}
/>;

export const HideChrome = (args) => <Graphistry {...defaultSettings}
  showToolbar={false}
  showInfo={false}
  showMenu={false}
  showHistograms={false}
  {...args}
/>;

export const HideChromeButShowTools = (args) => <Graphistry {...defaultSettings}
  showToolbar={false}
  showInfo={false}
  showMenu={false}
  showHistograms={true}
  showInspector={true}
  showLabelInspector={true}
  showLabelActions={true}
  {...args}
/>;

export const TogglePanelFilters = (args) => <Graphistry {...defaultSettings}
    togglePanel={'filters'}
    {...args}
  />;

export const TogglePanelExclusions = (args) => <Graphistry {...defaultSettings}
  togglePanel={'exclusions'}
  {...args}
/>;

export const TogglePanelScene = (args) => <Graphistry {...defaultSettings}
  togglePanel={'scene'}
  {...args}
/>;

export const TogglePanelLabels = (args) => <Graphistry {...defaultSettings}
  togglePanel={'labels'}
  {...args}
/>;

export const TogglePanelLayout = (args) => <Graphistry {...defaultSettings}
  togglePanel={'layout'}
  {...args}
/>;

export const TogglePanelNone = (args) => <Graphistry {...defaultSettings}
  togglePanel={false}
  {...args}
/>;

export const ScalePointSize = (args) => <Graphistry {...defaultSettings}
  encodePointSize={'betweenness'}
  pointSize={0.2}
  {...args}
/>;

export const BindPointSizeCategorical = (args) => {

  //Load sizes 3s after client connected (workaround timing bug)
  const [ sizes, setSizes ] = useState();

  return <Graphistry {...defaultSettings}
    dataset={'6fbdc5fb9ca64f37ade8a7a5ccb337f0'}
    {...args}
    onClientAPIConnected={ () => {
      setTimeout(() => {
        console.debug('Setting sizes 3s after client connected');
        setSizes(args.encodePointSize || [
          'tag_wearamask',
          {
            encodingType: 'size',
            graphType: 'point',
            attribute: 'tag_wearamask',
            mapping: {
                categorical: {
                    fixed: {
                        0: 1,
                        1: 1,
                        2: 10,
                        3: 1,
                        4: 1
                    },
                    other: 1
                }
            }
          }
        ]);
      }, 3000);
    }}
    encodePointSize={sizes}
    pointSize={0.5}
  />;
}

export const BindPointColorContinuous = (args) => {

  //Load colors 3s after client connected (workaround timing bug)
  const [ colors, setColors ] = useState();
  
  return <Graphistry {...defaultSettings}
    dataset={'6fbdc5fb9ca64f37ade8a7a5ccb337f0'}
    {...args}
    onClientAPIConnected={ () => {
      setTimeout(() => {
        console.debug('Setting colors 3s after client connected');
        setColors(args.encodePointColor || [
          'degree',
          'continuous',
          ['#00f', '#f00', 'yellow']
        ]);
      }, 3000);
    }}
    encodePointColor={colors}
  />;
}

export const LayoutSettings = (args) => <Graphistry {...defaultSettings}
  precisionVsSpeed={0.5}
  gravity={0.5}
  scalingRatio={0.5}
  edgeInfluence={0.5}
  strongGravity={true}
  dissuadeHubs={true}
  linLog={true}
  {...args}
/>;

export const LayoutLockedX = (args) => <Graphistry {...defaultSettings}
  lockedX={true}
  {...args}
/>;

export const LayoutLockedY = (args) => <Graphistry {...defaultSettings}
  lockedY={true}
  {...args}
/>;

export const LayoutLockedRadius = (args) => <Graphistry {...defaultSettings}
  lockedR={true}
  {...args}
/>;

export const RadialAxisAndLayout = (args) => <Graphistry {...defaultSettings}
  lockedR={true}
  backgroundColor='#f0f0f0'
  axes={[
        {r: 40},
        {internal: true, label: "my inner label", r: 80},
        {r: 120},
        {external: true, label: "my outer label", r: 160},
        {r: 200},
        {r: 220}
    ]}
/>;

export const VerticalAxisAndLayout = (args) => <Graphistry {...defaultSettings}
  lockedY={true}
  backgroundColor='#f0f0f0'
  axes={[
    {
        label: 'bottom category',
        bounds: {min: 'bot min bound', max: 'bot max bound'},
        y: 0,
        width: 100
    },
    {
        label: 'mid category bottom',
        bounds: {min: 'mid min', max: 'mid max'},
        y: 20,
        width: 200
    },
    {
        label: 'mid category top',
        //bounds: {min: 'mid top min', max: 'mid top max'},
        y: 40,
        //width: 20
    },
    {
        label: 'top category',
        bounds: {min: 'top min', max: 'top max'},
        y: 60,
        width: 100
    },
  ]}
/>;
export const Filters = (args) => {

  //Load filters 1s after client connected (workaround timing bug)
  const [ filter, setFilter ] = useState();
  const [ exclusion, setExclusion ] = useState();
  const [ panel, setPanel ] = useState();
  
  return <Graphistry {...defaultSettings}
    pruneOrphans={true}
    {...args}
    onClientAPIConnected={ () => {
      console.debug('Client connected, setting filters and exclusions after 3s');
      setTimeout(() => {
        setFilter(args.filters || ['point:community_infomap in (4, 5, 6)', 'point:degree > 1']);
        setExclusion(args.exclusions || ['edge:id = 1']);
        setPanel(['filters', false])
      }, 3000);
    } }
    togglePanel={panel}
    exclusions={exclusion}
    filters={filter}
  />;
}

//export const Ticks = (args) => <Graphistry {...defaultSettings} play={0} ticks={20} {...args} />;
export const Ticks = (args) => <h2>Not implemented</h2>;