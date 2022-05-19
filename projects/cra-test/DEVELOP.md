# Develop

For local testing, it can help to change the sample project as follows:
  

## Install

Link to local `@graphistry/client-api-react`: 

```bash
lerna bootstrap
```

## Conflict testing:

* Add `@graphistry/cra-template` to `cra-test`'s `package.json` and run `lerna bootstrap` again

* Add the following to your `app.js`:

```javascript
import { App as Component } from '@graphistry/cra-template';
window.ReactApp = React;
console.log('Component', {Component})
console.debug('same React?', {
    RApp: window.ReactApp,
    RComp: window.ReactComponent,
    same: window.ReactApp === window.ReactComponent.Component
});

<Component/>
```
