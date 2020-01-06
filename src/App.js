import React from 'react';
import logo from './logo.svg';
import './App.css';
import Renderer from './Containers/renderer';
import Editor from './Containers/editor';

function App() {

  const isMobile = {
    Android: function () {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
      return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function () {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
  };

  return (
    <div className="App">
      <Editor />
      <Renderer isMobile={!!isMobile.any()} ></Renderer>
    </div>
  );
}

export default App;
