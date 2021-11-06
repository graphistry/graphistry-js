# Graphistry's Client API React Component

## Automatically upload and visualize datasets using React, powered by Graphistry's GPU graph visualization infrastructure.

### Install

`npm install @graphistry/client-api-react`

### Usage

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import {Graphistry} from '@graphistry/client-api-react';
import '@graphistry/client-api-react/assets/index.less';

ReactDOM.render(
    <Graphistry dataset='Miserables'
                graphistryHost='https://hub.graphistry.com'/>,
    document.getElementById('react-root')
);

```

There are more examples in the `examples` directory.
