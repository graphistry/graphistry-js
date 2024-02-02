import React from 'react';
import '../../assets/index.css';

import { Graphistry } from '../index';

export default {
  title: 'Graphistry: React upload',
  component: Graphistry,
};

export const Empty = {};
export const PredefinedDataset = {
  render: (args) => <Graphistry {...args} dataset="Miserables" showSplashScreen={true} />,
};

const defaultSettings = {
  //dataset: 'Miserables',
  play: 1,
  showSplashScreen: true,
};

export const UploadEdges = {
  render: (args) => (
    <Graphistry
      {...defaultSettings}
      play={1}
      apiKey={'PUT_KEY_HERE'}
      bindings={{
        sourceField: 's',
        destinationField: 'd',
        idField: 'n',
      }}
      edges={[
        { s: 'a', d: 'b', v: 2 },
        { s: 'b', d: 'c', v: 3 },
      ]}
      {...args}
    />
  ),
};

export const UploadEdgesAndNodes = {
  render: (args) => (
    <Graphistry
      {...defaultSettings}
      play={1}
      apiKey="PUT_KEY_HERE"
      bindings={{
        sourceField: 's',
        destinationField: 'd',
        idField: 'n',
      }}
      edges={[
        { s: 'a', d: 'b', v1: 2 },
        { s: 'b', d: 'c', v1: 3 },
      ]}
      nodes={[
        { n: 'a', v2: 2 },
        { n: 'b', v2: 4 },
      ]}
      {...args}
    />
  ),
};
