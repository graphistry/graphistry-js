[![Latest docs](https://img.shields.io/badge/docs-latest-brightgreen)](http://hub.graphistry.com/docs)
![npm](https://img.shields.io/npm/v/@graphistry/client-api?label=%40graphistry%2Fclient-api&logo=npm)
![npm](https://img.shields.io/npm/v/@graphistry/client-api?label=%40graphistry%2Fclient-api-react&logo=npm)
![GitHub](https://img.shields.io/github/license/graphistry/graphistry-js)

[<img src="https://img.shields.io/badge/slack-Graphistry%20chat-yellow.svg?logo=slack">](https://join.slack.com/t/graphistry-community/shared_invite/zt-53ik36w2-fpP0Ibjbk7IJuVFIRSnr6g) 
![Twitter Follow](https://img.shields.io/twitter/follow/graphistry)


# GraphistryJS - Explore relationships with GPU visual graph analytics

GraphistryJS is a rich and scalable graph visualization library to extract, transform, and load big graphs into Graphistry's GPU visual graph intelligence platform and dynamically control the style and interactions. It is typically used by developers on problems like visually mapping the behavior of devices and users, especially when there are many events or entities involved.  GraphistryJS controls embedded Graphistry server sessions, such as for [free Graphistry Hub accounts](https://www.graphistry.com/get-started) and private servers.

If JavaScript is not your thing, data scientists and analysts should consider exploring initial GPU-accelerated prototype iterations in [Python notebooks with PyGraphistry](https://github.com/graphistry/pygraphistry) and [Graph-App-Kit for StreamLit dashboards](https://github.com/graphistry/graph-app-kit). Likewise, the underlying [Graphistry REST APIs](https://hub.graphistry.com/docs/api/) work with any language and with many data formats.

### Graphistry
Graphistry supports unusually large graphs for interactive visualization. The client's custom WebGL rendering engine renders up to 8MM nodes and edges at a time, and most older client GPUs smoothly support somewhere between 100K and 1MM elements. The serverside GPU analytics engine supports even bigger graphs. Graphistry comes with many prebuilt visual analytics tools like clustering, interactive histograms and timebars, data brushing, point-and-click filtering.  Graphistry can be used standalone by analysts, through notebooks by data scientists, and embedded through multiple language and REST APIs.

You can [launch your own Graphistry server with just a few clicks](https://www.graphistry.com/get-started).

### JavaScript client APIs
The JavaScript client APIs makes it easy to embed visual graph analytics into JavaScript frontends and control the style and interactions. Developers can quickly prototype and deploy stunning solutions.

GraphistryJS comes in 2 flavors:

http://localhost:60863/?path=/story/graphistry-vanilla-js--instantiate-graphistry-js

* [client-api](projects/client-api/README.md) ([interactive storybook docs](https://graphistry.github.io/graphistry-js/?path=/story/graphistry-vanilla-js)): Pure JavaScript API taking advantage of reactive/observable style code for chaining async code
* [client-api-react](projects/client-api-react/README.md) ([interactive storybook docs](https://graphistry.github.io/graphistry-js/)): React component for typical cases

### Architecture

You can think of Graphistry as a live data version of Google Maps.

* Graphistry runs as an embedded iframe that streams live with your Graphistry server
* GraphistryJS runs as a lightweight JavaScript library in your application. It simplifies creating the iframe, uploading data for visualization as needed, and sending the iframe messages to control style and interactions
* GraphistryJS can be used to upload and view new visualizations, or run sessions for existing uploads, including those from other clients
* User and GraphistryJS interactions will transparently leverage the Graphistry server as needed, such as for loading a graph, running analytics, drilling into data, and saving settings

### Security

* You can configure your Graphistry server to run as http, https, or both
* Uploads (generally) require API keys. Log in to your server for your account's API key and information on how to generate new ones
* Sessions are based on unguessable web keys: sharing a secret ID means sharing read access
* Datasets are immutable and thus their integrity is safe for sharing, while session state (e.g., filters) are writable: share a copy when in doubt
