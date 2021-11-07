import React from 'react';
import '../../assets/index.css';

import { Graphistry } from '../index';

export default {
  title: 'Graphistry: React upload',
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

export const UploadEdges = (args) => <Graphistry {...defaultSettings}
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
  {...args}
/>;

export const UploadEdgesAndNodes = (args) => <Graphistry {...defaultSettings}
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
  {...args}
/>;
