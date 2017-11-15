import React from 'react';
import ReactDOM from 'react-dom';
import Timebar from '../src/index.js';
const app = document.getElementById('main');

const data = require('./data.json');
const bins = [];
for (var i = 0; i < data.bins.length; i++) {
    bins.push(data.bins[i]);
}

ReactDOM.render(<Timebar bins={bins} />, app);
