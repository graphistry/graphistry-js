import React from 'react';
import '../../assets/index.css';

import { Graphistry } from '../index';


const defaultSettings = {
  dataset: 'Miserables',
  //showSplashScreen: false
};

export default {
  title: 'Graphistry',
  component: Graphistry,
  argTypes: {
    'dataset': {
      control: { type: 'select', options: ['Miserables', 'Facebook', undefined, null] },
    }
  }
};

const Template = (args) => <Graphistry {...args} />;


export const Empty = Template.bind({});
Empty.args = {};

export const PredefinedDataset = Template.bind({});
PredefinedDataset.args = {
  ...defaultSettings,
};

export const CustomStyle = Template.bind({});
CustomStyle.args = {
  ...defaultSettings,
    containerStyle: {
      'width': '100px',
      'height': '100px',
      'backgroundColor': 'red',
      'border': '4px dotted blue'
    },
    containerClassName: '',
    iframeClassName: '',
    iframeStyle: {
      'width': '100%',
      'height': '100%',
      'border': 'none'
    }
};

export const CustomColors = Template.bind({});
CustomColors.args = {
  ...defaultSettings,
    backgroundColor: '#f0f0f0',
    labelOpacity: 0.5,
    labelColor: 'magenta',
    labelBackground: '#ffffff',
};

export const PointSettings = Template.bind({});
PointSettings.args = {
  ...defaultSettings,
  pointSize: 10,
  pointOpacity: 0.5,
};

export const EdgeSettings = Template.bind({});
EdgeSettings.args = {
  ...defaultSettings,
  edgeCurvature: 0.5,
  edgeOpacity: 0.5,
  showArrows: false
};

export const HoverPropertiesInsteadOfInspector = Template.bind({});
HoverPropertiesInsteadOfInspector.args = {
  ...defaultSettings,
  showLabelPropertiesOnHover: true
}

export const LabelsOnlyOnHover = Template.bind({});
LabelsOnlyOnHover.args = {
  ...defaultSettings,
  showPointsOfInterest: false
};

export const PointsOfInterestWithoutTextLabel = Template.bind({});
PointsOfInterestWithoutTextLabel.args = {
  ...defaultSettings,
  showPointsOfInterestLabel: false
};

export const ManyPointsOfInterest = Template.bind({});
ManyPointsOfInterest.args = {
  ...defaultSettings,
  pointsOfInterestMax: 50
};

export const HideChrome = Template.bind({});
HideChrome.args = {
  ...defaultSettings,
  showToolbar: false,
  showInfo: false,
  showMenu: false,
};

export const HideChromeButShowTools = Template.bind({});
HideChromeButShowTools.args = {
  ...defaultSettings,
  showToolbar: false,
  showInfo: false,
  showMenu: false,
  showHistograms: true,
  showInspector: true,
};

export const BindPointSize = Template.bind({});
BindPointSize.args = {
  ...defaultSettings,
  encodePointSize: 'betweenness',
  pointSize: 0.2
};

export const BindPointSizeCategorical = Template.bind({});
BindPointSize.args = {
  ...defaultSettings,
  encodePointSize: [
    'community_infomap',
    {
      encodingType: 'size',
      graphType: 'point',
      attribute: 'community_infomap',
      mapping: {
          categorical: {
              fixed: {
                  0: 2,   // -> 'red', or '#fff', or '2.0'
                  1: 3,
                  2: 2,
                  3: 3,
                  4: 2
              },
              other: 1
          }
      }
  }
  ],
  pointSize: 0.2
};

export const LayoutSettings = Template.bind({});
LayoutSettings.args = {
  ...defaultSettings,
  precisionVsSpeed: 0.5,
  gravity: 0.5,
  scalingRatio: 0.5,
  edgeInfluence: 0.5,
  strongGravity: true,
  dissuadeHubs: true,
  linLog: true
}

export const LayoutLockedX = Template.bind({});
LayoutLockedX.args = {
  ...defaultSettings,
  lockedX: true
};

export const LayoutLockedY = Template.bind({});
LayoutLockedY.args = {
  ...defaultSettings,
  lockedY: true
};

export const LayoutLockedRadius = Template.bind({});
LayoutLockedRadius.args = {
  ...defaultSettings,
  lockedR: true
};

export const Filters = Template.bind({});
Filters.args = {
  ...defaultSettings,
  filters: ['point:community_infomap in (4, 5, 6)', 'point:degree > 1'],
  exclusions: ['edge:id = 1'],
  //pruneOrphans: true
};
