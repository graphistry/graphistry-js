import React, { useRef, useState, useEffect, useCallback } from 'react'

window.ReactComponent = React;

function App() {
  const [count, setCount] = useState(0);  // FIXME: https://reactjs.org/link/invalid-hook-call
  console.log('cra-template app::render', {React});
  return (
    <div className="App">
      <header className="App-header">
        <p>
          My component!
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export { App };
