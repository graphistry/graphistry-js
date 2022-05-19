# Graphistry's Client API React Component

## Automatically upload and visualize datasets using React, powered by Graphistry's GPU graph visualization infrastructure.

### Install

`npm install @graphistry/client-api-react`

### Usage

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { Graphistry } from '@graphistry/client-api-react';
import '@graphistry/client-api-react/assets/index.less';

ReactDOM.render(
    <Graphistry dataset='Miserables'
                graphistryHost='https://hub.graphistry.com'/>,
    document.getElementById('react-root')
);

```

For React examples, see the ([interactive storybook docs](https://graphistry.github.io/graphistry-js/))

### Versions

* `@graphistry/client-api-react` wraps `@graphistry/client-api`, so use aligned versions
* By default, `React` is linked as an external dependency (16.8+ and 17.0+)
* You can use multiple module formats: `@graphistry/client-api-react` (default) or pick a specific format via `@graphistry/client-api-react/dist/index.{esm,cjs,iife}.js`
* You can also use the library standalone, where React is already inlined: `@graphistry/client-api-react/dist/index.full.{esm,cjs,iife}.js`
