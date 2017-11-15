# Graphistry Timebar
This is a simple react component which renders a histogram as prepared by the graphistry server.

This particular histogram renderer expects to receive temporal data. It supports selection (via brush) and zooming (via scrolling) but as an issue right now that in order to enable the brush I had to disable panning on zoom. This means that if you zoom into a spot you don't care about, you have to zoom out and zoom in elsewhere - you can't drag around within the zoomed in state.

This is fine, I think, because there will be buttons to make this a bit easier.

## Seeing it in Action
Check out this repo, install the dependencies and run `npm run dev` to see the example. This is also how I develop - note that webpack is side-stepped for the build step, which runs pre-publish.