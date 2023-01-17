import React, { useCallback } from 'react';
import './App.css';
import { Graphistry } from '@graphistry/client-api-react';

console.debug('app', { Graphistry, React });

const LOCAL_DEV = {
  graphistryHost: "http://0.0.0.0:3000",
  play: 0,
  session: "cycle"
}

function App() {
  const onUpdateObservableG = useCallback((err, v) => {
    console.info('onUpdateObservableG returned', v, '@CRA')
  }, []);

  const onSelectionUpdate = useCallback((err, v) => {
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
      <Graphistry
        dataset='Miserables'
        containerClassName='Content'
        iframeStyle={{ height: '100%', width: '100%', border: 0 }}
        onUpdateObservableG={onUpdateObservableG}
        onSelectionUpdate={onSelectionUpdate}
        onLabelsUpdate={onLabelsUpdate}
      />
    </div>
  );
}

export default App;
