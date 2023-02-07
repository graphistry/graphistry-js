import React, { useCallback, useState } from 'react';
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

function App() {
  const [selection, setSelection] = useState(undefined);

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


  return (
    <div className="App">
      <header className="App-header">
        Embeded Graphistry
      </header>
      <div className="Content">
        <Graphistry
          dataset='Miserables'
          containerClassName='graphistry-container'
          iframeStyle={IFRAME_STYLE}
          onUpdateObservableG={onUpdateObservableG}
          onSelectionUpdate={onSelectionUpdate}
          onLabelsUpdate={onLabelsUpdate}
          {...LOCAL_DEV}
        />
        <SidebarSelection selection={ selection } />
      </div>
    </div>
  );
  }
export default App;
