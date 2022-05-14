<img height=48 src="https://hub.graphistry.com/static/assets/images/logo/banner_transparent_colored.png">

[![Latest docs](https://img.shields.io/badge/docs-latest-brightgreen)](https://graphistry.github.io/graphistry-js/)
[![npm](https://img.shields.io/npm/v/@graphistry/client-api?label=%40graphistry%2Fclient-api&logo=npm)](https://www.npmjs.com/package/@graphistry/client-api)
[![npm](https://img.shields.io/npm/v/@graphistry/client-api?label=%40graphistry%2Fclient-api-react&logo=npm)](https://www.npmjs.com/package/@graphistry/client-api-react)
![GitHub](https://img.shields.io/github/license/graphistry/graphistry-js)

![CI main](https://github.com/graphistry/graphistry-js/workflows/CI/badge.svg) ![CI docs](https://github.com/graphistry/graphistry-js/workflows/Storybook/badge.svg)

[<img src="https://img.shields.io/badge/slack-Graphistry%20chat-yellow.svg?logo=slack">](https://join.slack.com/t/graphistry-community/shared_invite/zt-53ik36w2-fpP0Ibjbk7IJuVFIRSnr6g) 
![Twitter Follow](https://img.shields.io/twitter/follow/graphistry)

---

# GraphistryJS - Explore relationships with GPU visual graph analytics

<img height=30 src="http://3con14.biz/code/_data/js/intro/js-logo.png"> <img height=30 src="https://raw.githubusercontent.com/remojansen/logo.ts/master/ts.jpg"> <img height=30 src="https://raw.githubusercontent.com/jalbertsr/logo-badge-images/master/img/react_logo.png"> <img height=30 src="https://raw.githubusercontent.com/caiogondim/javascript-server-side-logos/master/node.js/standard/454x128.png">


GraphistryJS is a rich and scalable graph visualization library to extract, transform, and load big graphs into Graphistry's GPU visual graph intelligence platform and dynamically control the style and interactions. It is typically used by developers on problems like visually mapping the behavior of devices and users, especially when there are many events or entities involved.  GraphistryJS controls embedded Graphistry server sessions, such as for [free Graphistry Hub accounts](https://www.graphistry.com/get-started) and private servers.

If JavaScript is not your thing, data scientists and analysts should consider exploring initial GPU-accelerated prototype iterations in [Python notebooks with PyGraphistry](https://github.com/graphistry/pygraphistry) and [Graph-App-Kit for StreamLit dashboards](https://github.com/graphistry/graph-app-kit). Likewise, the underlying [Graphistry REST APIs](https://hub.graphistry.com/docs/api/) work with any language and with many data formats.

### Graphistry
Graphistry supports unusually large graphs for interactive visualization. The client's custom WebGL rendering engine renders up to 8MM nodes and edges at a time, and most older client GPUs smoothly support somewhere between 100K and 1MM elements. The serverside GPU analytics engine supports even bigger graphs. Graphistry comes with many prebuilt visual analytics tools like clustering, interactive histograms and timebars, data brushing, point-and-click filtering.  Graphistry can be used standalone by analysts, through notebooks by data scientists, and embedded through multiple language and REST APIs.

You can [launch your own Graphistry server with just a few clicks](https://www.graphistry.com/get-started).

### JavaScript clients: Vanilla JS, React, & Node

<img height=48 src="http://3con14.biz/code/_data/js/intro/js-logo.png"/>

**@graphistry/client-api**: Pure JavaScript API for manipulating Graphistry visualizations in the browser with async-friendly APIs

```bash
npm install '@graphistry/client-api'
```

```javascript
import { graphistryJS } from '@graphistry/client-api'; // + variants for different bundling formats
const g = graphistryJS(elt);
```

See [@graphistry/client-api project](projects/client-api/README.md) and [interactive storybook docs](https://graphistry.github.io/graphistry-js/?path=/story/graphistry-vanilla-js)


---
<img height=48 src="https://raw.githubusercontent.com/jalbertsr/logo-badge-images/master/img/react_logo.png"/>

**@graphistry/client-api-react**: React component for manipulating Graphistry visualizations in the browser

```bash
npm install '@graphistry/client-api-react'
```

```javascript
import { Graphistry } from '@graphistry/client-api-react';` // + variants for different bundling formats
<Graphistry dataset="myDatasetID" />
```

See [@graphistry/client-api-react project](projects/client-api-react/README.md) and [interactive storybook docs](https://graphistry.github.io/graphistry-js/)


---
<img height=48 src="https://raw.githubusercontent.com/caiogondim/javascript-server-side-logos/master/node.js/standard/454x128.png" />

**@graphistry/node-api**: Node.js bindings, including optional Typescript support, for creating visualizations and generating URLs

```bash
npm install '@graphistry/node-api'
```

```javascript
import { Client, Dataset, EdgeFile, NodeFile } from '@graphistry/node-api'
const client = new Client(user, pass);
const ds = new Dataset(bindings, new EdgeFile(edges));
await ds.upload(client);
```

See [@graphistry/node-api project](projects/node-api/README.md) and [API docs & examples](https://graphistry.github.io/graphistry-js/node-tsdocs/)

### Architecture

You can think of Graphistry as a live data version of Google Maps.

Clientside (client-api & client-api-react):

* Graphistry runs as an embedded iframe that streams live with your Graphistry server
* GraphistryJS runs as a lightweight JavaScript library in your application. It simplifies creating the iframe, uploading data for visualization as needed, and sending the iframe messages to control style and interactions
* GraphistryJS can be used to upload and view new visualizations, or run sessions for existing uploads, including those from other clients
* User and GraphistryJS interactions will transparently leverage the Graphistry server as needed, such as for loading a graph, running analytics, drilling into data, and saving settings

Serverside (node-api):

* GraphistryJS can be used to upload new files and stitch them into graph datasets
* The resulting server item IDs can be sent to browsers for embedding either as iframe URLs or GraphistryJS IDs, or additional server-side manipulations

### Decoupling uploads from downloads

To support server-acceleration and fast interactions, Graphistry decouples uploads from downloads

#### Uploads:

* Multiple upload formats are possible, but we recommend parquet & arrow for the best performance and high reliability
* Uploads are possible from browser clients (CSP/CORS support), but we generally recommend server<>server communications for better speed
* Different datasets may reuse the same file. Datasets are generally just a small amount of metadata, so for best performance, try to upload new datasets for existing files, instead of reuploading the files as well.

#### Downloads:

* Client sessions connect to previously uploaded datasets and their files
* Client session configurations can override settings initially defined during the upload phase

### Security

* You can configure your Graphistry server to run as http, https, or both
* Uploads require authentication
  * The `node-api` client already uses the new JWT-based protocol ("API 3")
  * Deprecated: The clientside JavaScript convenience APIs still use the deprecrated "API 1" protocol (key-based), which lacks JWT-based authentication and authorization
    * We recommend clients instead use `fetch` or other HTTP callers to directly invoke the REST API: See how the `node-api` performs it
    * The client JavaScript APIs will updated to the new JWT method alongside recent CORS and SSO updates; contact staff if you desire assistance
* Sessions are based on unguessable web keys: sharing a secret ID means sharing read access
* Datasets are immutable and thus their integrity is safe for sharing, while session state (e.g., filters) are writable: share a copy when in doubt
