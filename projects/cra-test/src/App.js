import React, { useRef, useState, useEffect, useCallback } from 'react'
import logo from './logo.svg';
import './App.css';

import { App as Component } from '@graphistry/cra-template';
import { Graphistry } from '@graphistry/client-api-react';

window.ReactApp = React;

console.log('app', {Component, Graphistry, React})

function App() {

  console.debug('same React?', {
    RApp: window.ReactApp,
    RComp: window.ReactComponent,
    same: window.ReactApp == window.ReactComponent.Component})

  return (
    <div className="App">
      <header className="App-header">
        <h1>G</h1>
        <Graphistry dataset={'Miserables'}/>
        <h1>C</h1>
        <Component/>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
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

export default App;
