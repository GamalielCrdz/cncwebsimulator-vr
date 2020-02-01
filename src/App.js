import React from "react";
/* import logo from './logo.svg'; */
import "./App.css";
import styled from "styled-components";
import Renderer from "./Containers/renderer";
/* import Editor from './Containers/editor'; */
import Navbar from "./Containers/navbar";

const AppWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

function App() {
  // const [editorValue, setEditorValue] = useState("");
  // const [currentLine, setCurrentLine] = useState(0);

  const isMobile = {
    Android: function() {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
      return (
        navigator.userAgent.match(/IEMobile/i) ||
        navigator.userAgent.match(/WPDesktop/i)
      );
    },
    any: function() {
      return (
        isMobile.Android() ||
        isMobile.BlackBerry() ||
        isMobile.iOS() ||
        isMobile.Opera() ||
        isMobile.Windows()
      );
    }
  };

  // function getEditorValue(){
  //   return editorValue;
  // }
  const navbarHeigth = 60;

  return (
    <div className="App">
      <Navbar navbarHeigth={navbarHeigth} />
      <AppWrapper>
        <Renderer isMobile={!!isMobile.any()} navbarHeigth={navbarHeigth}  />
      </AppWrapper>
    </div>
  );
}

export default App;
