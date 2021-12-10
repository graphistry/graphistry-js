# Graphistry's JavaScript Client API

## Graphistry's client-side interactions API makes it easy for developers to interact with embedded graph visualizations.

### Installation

The JS package supports commonjs, esm, and iffe formats. See [package.json](package.json) for `dist/` folder contents.

The `rxjs` version is an unpinned peer dependency:
- The bundled versions `dist/index.{cjs,esm,iife}.min.js` keep `rxjs` as an external package
- The bundled versions `dist/index.full.{cjs,esm,iife}.min.js` include it
- Use `dist/index.full.iife.min.js` for `<script src="..."/>` tags

## Docs

1. To use this interactions API, call GraphistryJS with an IFrame containing a graphistry vizualization
1. See [client-api](projects/client-api/README.md) ([interactive storybook docs](https://graphistry.github.io/graphistry-js/?path=/story/graphistry-vanilla-js))
1. Refer to the Graphistry class for a list of the methods currently supported. More on the way!
1. Refer to example in GraphistryJS

See also the [@graphistry/client-api-react React docs](../client-api-react)

## Import

Depending on the module format, you may use `import`, `require`, and `window.GraphistryModule`:

```javascript
const G = GraphistryModule;
const g = G.graphistryJS(elt);
```

```javascript
import { graphistryJS } from '@graphistry/client-api';
const g = graphistryJS(elt);
```

```javascript
const G = require('@graphistry/client-api');
const g = G.graphistryJS(elt);
```

## Dual usage modes

The library exposes two calling conventions to choose from.

#### RxJS orchestrations

```javascript
const G = GraphistryModule;
document.addEventListener("DOMContentLoaded", function () {

    var g = G.graphistryJS(document.getElementById('viz'));
    var sub = g.pipe(
            G.tap(() => console.log('GraphistryJS ready instance as window.g')),
            G.delay(5000),
            G.addFilter('point:degree > 1'),
            G.updateSetting('background', '#FF0000')
        )
        .subscribe(
            function () {},
            function (err) { console.error('exn on setup', err); },
            function () { console.log('finished setup'); });

    //Optional: sub.unsubscribe() to cancel

});
```

#### Async commands

```javascript
const G = GraphistryModule;
document.addEventListener("DOMContentLoaded", function () {

    var g = G.graphistryJS(document.getElementById('viz'));
    g.pipe(
        G.tap(() => {

            //non-rxjs on ready g
            console.log('GraphistryJS ready instance as window.g');
            setTimeout(
                () => {
                    g.addFilter();
                    g.updateSetting('background', '#FF0000');
                },
                5000);

        }))
        .subscribe();

});
```
