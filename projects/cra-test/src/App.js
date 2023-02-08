import React, { useCallback, useState } from 'react';
import './App.css';
import { Graphistry } from '@graphistry/client-api-react';
import SidebarSelection from './SidebarSelection';

console.debug('app', { Graphistry, React });

const LOCAL_DEV = {
  graphistryHost: "https://test-2-39-44-a.grph.xyz/",
  play: 500,
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
          dataset='0aa3f0699fde518db9e0b6d8db519182'
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
