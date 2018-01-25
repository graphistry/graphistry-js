# Graphistry Timebar
This is a simple react component which renders a histogram as prepared by the graphistry server.

To see this run, type `npm install && npm run dev` and it should open in your browser.

It takes four props: 
  1. `bins` is a normalized set of bins. See `example/app.js` to see how bins are set.
  2. `onSelect` is fired every time the component's selection changes. The payload is an array of selected bins. Again, see `example/app.js` to see it work.
  3. `onZoom` is fired every time the user uses the scrollwheel/two-finger-touch on the timebar. It actually gets the zoom event, and one outstanding unit of work is to wire up that event to our falcor server.
  4. `onHighlight` is fired every time the user mouses over or out of a bar. It is called with the bin index to highlight.

Currently there's an issue with react versions when using this in viz-app.

To use in viz-app, make sure `vizapp/packages/viz-app/package.json` has the correct version for `@graphistry/timebar`. You'll find the timebar component wired up in `/viz-app/packages/viz-app/src/containers/timebar/components/timebar.js`. The `onZoom`, `onSelect` and `onHighlight` functions are wired up. 

The problem right now is that the selection area when you click+drag isn't mapping to actual position because the way that I'm getting bounds (in `src/index.js` in this repo, tagged with a comment at the top) seems to be breaking in viz-app (I think due to version mismatch).