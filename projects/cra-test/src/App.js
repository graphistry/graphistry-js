import React, { useCallback, useState, useRef } from 'react';
import './App.css';
import { Graphistry } from '@graphistry/client-api-react';
import SidebarSelection from './SidebarSelection';

console.debug('app', { Graphistry, React });

const LOCAL_DEV = {
  graphistryHost: "http://0.0.0.0:3000",
  play: 0,
  session: "cycle"
}

// If this is inline it causes graphistry to refresh.
const IFRAME_STYLE = { height: '100%', width: '100%', border: 0 };
const SELECTION_API_OPTIONS = { pageSize: 10, withColumns: true };

function App() {
  const graphistryRef = useRef();
  const [selection, setSelection] = useState(undefined);
  const [inputSelection, setInputSelection] = useState('{ "point": [], "edge": [0] }');
  const [show, setShow] = useState(false);

  const onUpdateObservableG = useCallback((err, v) => {
    console.info('onUpdateObservableG returned', v, '@CRA')
  }, []);

  const onSelectionUpdate = useCallback((err, v) => {
    setSelection(v);
    console.info('onSelectionUpdate returned', v, err, '@CRA')
  }, []);

  const onLabelsUpdate = useCallback((err, v) => {
    console.info('onLabelsUpdate returned', v, err, '@CRA')
  }, []);

  const injectSelection = () => {
    const s = JSON.parse(inputSelection);
    console.log('Attempting to set selection to ', s, '@CRA');
    graphistryRef.current.setSelectionExternal(s);
  }

  const injectHighlight = () => {
    const s = JSON.parse(inputSelection);
    console.log('Attempting to set highlight to ', s, '@CRA');
    graphistryRef.current.setHighlightExternal(s);
  }

  const callAddFilter = () => {
    graphistryRef.current.addFilter('point:degree > 0');
  }

  return (
    <div className="App">
      <header className="App-header">
        Embeded Graphistry
        <button onClick={injectSelection}>Inject Selection</button>
        <button onClick={injectHighlight}>Inject Highlight</button>
        <input type="text" value={inputSelection} onChange={e => setInputSelection(e.target.value)}/>
        <button onClick={() => setShow(!show)}>Toggle Points of Interest {show ? 'off' : 'on'}</button>
        <button onClick={callAddFilter}>Add filter</button>
      </header>
      <div className="Content">
        <Graphistry
          ref={graphistryRef}
          containerClassName='graphistry-container'
          dataset="Miserables"
          iframeStyle={IFRAME_STYLE}
          onUpdateObservableG={onUpdateObservableG}
          onSelectionUpdate={onSelectionUpdate}
          selectionUpdateOptions={SELECTION_API_OPTIONS}
          onLabelsUpdate={onLabelsUpdate}
          showPointsOfInterest={show}
        />
        <SidebarSelection selection={ selection } />
      </div>
    </div>
  );
}

export default App;
