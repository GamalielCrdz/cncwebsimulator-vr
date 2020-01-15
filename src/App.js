import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Renderer from './Containers/renderer';
import Editor from './Containers/editor';
import Navbar from './Containers/navbar';

function App() {
  const [editorValue, setEditorValue] = useState("");
  const [currentLine, setCurrentLine] = useState(0);

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

  function getEditorValue(){
    return editorValue;
  }

  return (
    <div className="App">
      {/* <Navbar /> */}
      <Editor setEditorValue={setEditorValue} editorValue={editorValue} currentLine={currentLine} />
      <Renderer isMobile={!!isMobile.any()} getEditorValue={getEditorValue} setCurrentLine={setCurrentLine} />
    </div>
  );
}

export default App;
