<img height=48 src="https://hub.graphistry.com/static/assets/images/logo/banner_transparent_colored.png">


---

[![Latest docs](https://img.shields.io/badge/docs-latest-brightgreen)](https://graphistry.github.io/graphistry-js/)
[![npm](https://img.shields.io/npm/v/@graphistry/client-api?label=%40graphistry%2Fclient-api&logo=npm)](https://www.npmjs.com/package/ient-api)
[![npm](https://img.shields.io/npm/v/@graphistry/client-api?label=%40graphistry%2Fclient-api-react&logo=npm)](https://www.npmjs.com/package/@graphistry/client-api-react)
![GitHub](https://img.shields.io/github/license/graphistry/graphistry-js)

![CI main](https://github.com/graphistry/graphistry-js/workflows/CI/badge.svg) ![Security audit](https://github.com/graphistry/graphistry-js/workflows/Audit/badge.svg) ![CI docs](https://github.com/graphistry/graphistry-js/workflows/Storybook/badge.svg)

[<img src="https://img.shields.io/badge/slack-Graphistry%20chat-yellow.svg?logo=slack">](https://join.slack.com/t/graphistry-community/shared_invite/zt-53ik36w2-fpP0Ibjbk7IJuVFIRSnr6g)
![Twitter Follow](https://img.shields.io/twitter/follow/graphistry)

---

# GraphistryJS
## Web libraries for uploading and embedding graph visualization 

 - `@graphistry/client-api` - Pure JS API for manipulating Graphistry visualizations 
 - `@graphistry/client-api-react` - Graphistry vizualization React component
 - `@graphistry/node-api` - Node bindings to upload into Graphistry ecosystem
 - `@graphistry/js-upload-api` - Pure JS library for graph upload
 - `@graphistry/cra-test` - Example react app using these libraries

[Dev guide for contributors](./DEVELOP.md)

<br><br>

# Graphistry - Visual Graph Intelligence

GPU and AI acceleration for interactive visualization of large graphs. Used accross multiple industries for security, fraud, supply chain, social media analysis and more. Graphistry supports live explorations of large datasets by running server side GPUs to stream into a custom WebGL rendering engine. This enables graph metrics and dynamic layout of up to 8MM nodes and edges at a time, most older client GPUs smoothly support somewhere between 100K and 1MM elements.

You can 

- [Start with a free Graphistry Hub account](https://www.graphistry.com/get-started)
- [Create Python notebooks with PyGraphistry](https://github.com/graphistry/pygraphistry)
- [Build StreamLit dashboards in Graph-App-Kit](https://github.com/graphistry/graph-app-kit)
- [Directly interact with Graphistry REST APIs](https://hub.graphistry.com/docs/api/)
- [Launch your own Graphistry server with just a few clicks](https://www.graphistry.com/get-started)

<br><br>

# JavaScript clients: Vanilla JS, React, & Node

## @graphistry/client-api

<img height=48 src="http://3con14.biz/code/_data/js/intro/js-logo.png"/>

Pure JavaScript API for manipulating Graphistry visualizations in the browser with async-friendly APIs

```bash
npm install '@graphistry/client-api'
```

```javascript
import { graphistryJS } from "@graphistry/client-api"; // + variants for different bundling formats
const g = graphistryJS(elt);
```

See [@graphistry/client-api project](projects/client-api/README.md) and [interactive storybook docs](https://graphistry.github.io/graphistry-js/?path=/story/graphistry-vanilla-js)

<br><br>

## @graphistry/client-api-react

<img height=48 src="https://raw.githubusercontent.com/jalbertsr/logo-badge-images/master/img/react_logo.png"/>

React component for manipulating Graphistry visualizations in the browser

```bash
npm install '@graphistry/client-api-react'
```

```javascript
import { Graphistry } from '@graphistry/client-api-react';` // + variants for different bundling formats
<Graphistry dataset="myDatasetID" />
```

See [@graphistry/client-api-react project](projects/client-api-react/README.md), [interactive storybook docs](https://graphistry.github.io/graphistry-js/), and [Create React App project sample](projects/cra-test/README.md)

<br><br>

## @graphistry/node-api

<img height=48 src="https://raw.githubusercontent.com/caiogondim/javascript-server-side-logos/master/node.js/standard/454x128.png" />

**@graphistry/node-api**: Node.js bindings, including optional Typescript support, for creating visualizations and generating URLs

```bash
npm install '@graphistry/node-api'
```

```javascript
import { Client, Dataset, EdgeFile, NodeFile } from "@graphistry/node-api";
const client = new Client(user, pass);
const ds = new Dataset(bindings, new EdgeFile(edges));
await ds.upload(client);
```

See [@graphistry/node-api project](projects/node-api/README.md) and [API docs & examples](https://graphistry.github.io/graphistry-js/node-tsdocs/)

<br><br>

# Graphistry's Architecture

You can think of Graphistry as a live data version of Google Maps.

Clientside (client-api & client-api-react):

- Graphistry runs as an embedded iframe that streams live with your Graphistry server
- GraphistryJS runs as a lightweight JavaScript library in your application. It simplifies creating the iframe, uploading data for visualization as needed, and sending the iframe messages to control style and interactions
- GraphistryJS can be used to upload and view new visualizations, or run sessions for existing uploads, including those from other clients
- User and GraphistryJS interactions will transparently leverage the Graphistry server as needed, such as for loading a graph, running analytics, drilling into data, and saving settings

Serverside (node-api):

- GraphistryJS can be used to upload new files and stitch them into graph datasets
- The resulting server item IDs can be sent to browsers for embedding either as iframe URLs or GraphistryJS IDs, or additional server-side manipulations

## Decoupling uploads from downloads

To support server-acceleration and fast interactions, Graphistry decouples uploads from downloads

### Uploads:

- Multiple upload formats are possible, but we recommend parquet & arrow for the best performance and high reliability
- Uploads are possible from browser clients (CSP/CORS support), but we generally recommend server<>server communications for better speed
- Different datasets may reuse the same file. Datasets are generally just a small amount of metadata, so for best performance, try to upload new datasets for existing files, instead of reuploading the files as well.

### Downloads:

- Client sessions connect to previously uploaded datasets and their files
- Client session configurations can override settings initially defined during the upload phase

## Security

- You can configure your Graphistry server to run as http, https, or both
- Uploads require authentication
  - The `node-api` client already uses the new JWT-based protocol ("API 3")
  - Deprecated: The clientside JavaScript convenience APIs still use the deprecrated "API 1" protocol (key-based), which lacks JWT-based authentication and authorization
    - We recommend clients instead use `fetch` or other HTTP callers to directly invoke the REST API: See how the `node-api` performs it
    - The client JavaScript APIs will updated to the new JWT method alongside recent CORS and SSO updates; contact staff if you desire assistance
- Sessions are based on unguessable web keys: sharing a secret ID means sharing read access
- Datasets are immutable and thus their integrity is safe for sharing, while session state (e.g., filters) are writable: share a copy when in doubt
