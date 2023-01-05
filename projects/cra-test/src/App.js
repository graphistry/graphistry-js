import React, { useCallback } from 'react';
import './App.css';
import { Graphistry } from '@graphistry/client-api-react';

console.debug('app', { Graphistry, React });

function App() {
  const onUpdateObservableG = useCallback((arg) => {
    console.debug('CRA.onUpdateObservableG', arg, 'exor')
  }, []);

  const onSelectionUpdate = useCallback((v) => {
    console.debug('CRA.onSelectionUpdate', v, 'exor')
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        Embeded Graphistree
      </header>
      <Graphistry 
        dataset='Miserables'
        containerClassName='Content'
        iframeStyle={{ height: '100%', width: '100%', border: 0 }}
        onUpdateObservableG={onUpdateObservableG}
        onSelectionUpdate={onSelectionUpdate}
      />
    </div>
  );
}

export default App;
