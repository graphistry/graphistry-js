import './App.css';

import { Graphistry } from '@graphistry/client-api-react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Testing Graphistry</h1>
        <Graphistry dataset={'Miserables'}/>
      </header>
    </div>
  );
}

export default App;
