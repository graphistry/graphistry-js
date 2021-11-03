import React from 'react';
import '../../assets/index.css';

import { Graphistry } from '../index';

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
    dataset: 'Miserables'
};

export const CustomStyle = Template.bind({});
CustomStyle.args = {
    dataset: 'Miserables',
    containerStyle: {
      'width': '100px',
      'height': '100px',
      'background-color': 'red',
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