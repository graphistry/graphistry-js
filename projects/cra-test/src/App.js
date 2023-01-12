import React, { useCallback } from 'react';
import './App.css';
import { Graphistry } from '@graphistry/client-api-react';

console.debug('app', { Graphistry, React });

const LOCAL_DEV = {
  graphistryHost: "http://0.0.0.0:3000",
  play: 0,
  session: "cycle"
}

// const LOCAL_DEV = {};

function App() {
  const onUpdateObservableG = useCallback((err, v) => {
    console.info('CRA.onUpdateObservableG', v, 'exor')
  }, []);

  const onSelectionUpdate = useCallback((err, v) => {
    console.info('CRA.onSelectionUpdate', v, err, 'exor')
  }, []);

  const onLabelsUpdate = useCallback((err, v) => {
    console.info('CRA.onLabelsUpdate', v, err, 'exor')
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
        {...LOCAL_DEV}
      />
    </div>
  );
}

export default App;
