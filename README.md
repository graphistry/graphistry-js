# GraphistryJS

GraphistryJS is a visual graph analytics library to extract, transform, and load big graphs into Graphistry's GPU visual graph analytics platform and control the style and interactions. It is typically used by developers on problems like visually mapping the behavior of devices and users, especially when there are many events or entities involved.  We recommend data scientists considering exploring initial prototype iterations in [Python notebooks with PyGraphistry](https://github.com/graphistry/pygraphistry).

### Graphistry
Graphistry supports unusually large graphs for interactive visualization. The client's custom WebGL rendering engine renders up to 8MM nodes and edges at a time, and most older client GPUs smoothly support somewhere between 100K and 1MM elements. The serverside GPU analytics engine supports even bigger graphs. Graphistry comes with many prebuilt visual analytics tools like clustering, interactive histograms and timebars, data brushing, point-and-click filtering.  Graphistry can be used standalone by analysts, through notebooks by data scientists, and embedded through multiple language and REST APIs.

### JavaScript client APIs
The JavaScript client APIs makes it easy to embed visual graph analytics into JavaScript frontends and control the style and interactions. Developers can quickly prototype and deploy stunning solutions.

GraphistryJS comes in 2 flavors for the same functionality:

* [client-api](projects/client-api/README.md): Pure JavaScript API taking advantage of reactive/observable style code for chaining async code
* [client-api-react](projects/client-api-react/README.md): React component for simple embedding, configuration, and lightweight dynamic control 

