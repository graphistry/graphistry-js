import React from 'react';
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
  dataset: 'Miserables',
  play: 1,
  showSplashScreen: true
};

export const NoSplashScreen = (args) => <Graphistry {...defaultSettings} {...args} showSplashScreen={false} />;
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

export const ColorLabelsAndBackground = (args) => <Graphistry {...defaultSettings} {...args} 
    backgroundColor= '#f0f0f0'
    labelOpacity={0.5}
    labelColor='magenta'
    labelBackground='#ffffff'
/>;

export const PointSettings = (args) => <Graphistry {...defaultSettings} {...args}
    pointSize={10}
    pointOpacity={0.5}
/>;

export const EdgeSettings = (args) => <Graphistry {...defaultSettings} {...args}
    edgeCurvature={0.5}
    edgeOpacity={0.5}
    showArrows={false}
/>;

export const HoverPropertiesInsteadOfInspector = (args) => <Graphistry {...defaultSettings} {...args}
    showLabelPropertiesOnHover={true}
/>;

export const LabelsOnlyOnHover = (args) => <Graphistry {...defaultSettings} {...args}
    showPointsOfInterest={false}
/>;

export const PointsOfInterestWithoutTextLabel = (args) => <Graphistry {...defaultSettings} {...args}
    showPointsOfInterestLabels={false}
/>;

export const ManyPointsOfInterest = (args) => <Graphistry {...defaultSettings} {...args}
  pointsOfInterestMax={50}
/>;

export const HideChrome = (args) => <Graphistry {...defaultSettings} {...args}
  showToolbar={false}
  showInfo={false}
  showMenu={false}
  showHistograms={false}
/>;

export const HideChromeButShowTools = (args) => <Graphistry {...defaultSettings} {...args}
  showToolbar={false}
  showInfo={false}
  showMenu={false}
  showHistograms={true}
  showInspector={true}
/>;

export const BindPointSize = (args) => <Graphistry {...defaultSettings} {...args}
  encodePointSize={'betweenness'}
  pointSize={0.2}
/>;

export const BindPointSizeCategorical = (args) => <Graphistry {...defaultSettings} {...args}
  encodePointSize={[
    'community_infomap',
    {
      encodingType: 'size',
      graphType: 'point',
      attribute: 'community_infomap',
      mapping: {
          categorical: {
              fixed: {
                  0: 2,   // -> 'red', or '#fff', or '2.0'
                  1: 1,
                  2: 1,
                  3: 1,
                  4: 1
              },
              other: 1
          }
      }
  }
  ]}
  pointSize={0.2}
/>;

export const BindPointColorContinuous = (args) => <Graphistry {...defaultSettings} {...args}
  encodePointColor={[
    'betweenness',
    'continuous',
    {
      encodingType: 'color',
      graphType: 'point',
      attribute: 'betweenness',
      variation: 'continuous',
      colors: ['#fff', '#f00', '#0f0', '#00f']
    }
  ]}
  pointSize={0.2}
/>;

export const LayoutSettings = (args) => <Graphistry {...defaultSettings} {...args}
  precisionVsSpeed={0.5}
  gravity={0.5}
  scalingRatio={0.5}
  edgeInfluence={0.5}
  strongGravity={true}
  dissuadeHubs={true}
  linLog={true}
/>;

export const LayoutLockedX = (args) => <Graphistry {...defaultSettings} {...args}
  lockedX={true}
/>;

export const LayoutLockedY = (args) => <Graphistry {...defaultSettings} {...args}
  lockedY={true}
/>;

export const LayoutLockedRadius = (args) => <Graphistry {...defaultSettings} {...args}
  lockedR={true}
/>;

export const Filters = (args) => <Graphistry {...defaultSettings} {...args}
  filters={['point:community_infomap in (4, 5, 6)', 'point:degree > 1']}
  exclusions={['edge:id = 1']}
  pruneOrphans={true}
/>;

export const UploadEdges = (args) => <Graphistry {...defaultSettings} {...args}
  play={1}
  apiKey={'PUT_KEY_HERE'}
  bindings={{
    'sourceField': 's',
    'destinationField': 'd'
  }}
  edges={[
    {'s': 'a', 'd': 'b', 'v': 2},
    {'s': 'b', 'd': 'c', 'v': 3}
  ]}
/>;

export const UploadEdgesAndNodes = (args) => <Graphistry {...defaultSettings} {...args}
  play={1}
  apiKey='PUT_KEY_HERE'
  bindings={{
    'sourceField': 's',
    'destinationField': 'd',
    'idField': 'n'
  }}
  edges={[
    {'s': 'a', 'd': 'b', 'v1': 2},
    {'s': 'b', 'd': 'c', 'v1': 3}
  ]}
  nodes={[
    {'n': 'a', 'v2': 2},
    {'n': 'b', 'v2': 4},
  ]}
/>;
