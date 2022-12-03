import React from 'react';
import './App.css';

import { Client, Graphistry } from '@graphistry/client-api-react';


console.debug('app', { Graphistry, React });

function App() {
  const onSubscription = (obs, sub) => {
    console.debug('sub', { obs, sub });
  }

  return (
    <div className="App">
      <header className="App-header">
        Embeded Graphistry
      </header>
      <Graphistry 
        containerClassName='Content'
        dataset={'Miserables'}
        iframeStyle={{ height: '100%', width: '100%', border: 0 }}
        onSubscription={onSubscription}
      />
    </div>
  );
}

export default App;
