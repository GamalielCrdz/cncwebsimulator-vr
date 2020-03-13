import React, { useState, useRef, useEffect } from "react";
/* import logo from './logo.svg'; */
import "./App.css";
import styled from "styled-components";
import Renderer from "./Containers/renderer";
import Editor from "./Containers/editor";
import Controls from "./Containers/controls";
import Navbar from "./Containers/navbar";

const AppWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

function App() {
  const [editorValue, setEditorValue] = useState("");
  const [currentLine, setCurrentLine] = useState(0);
  const [toggle, setToggle] = useState(true);
  const rendererElement = useRef(null);
  const frame = useRef(null);
  const navbarHeigth = 0;

  useEffect(() => {
    rendererElement.current.handleWindowResize();
  }, [toggle]);
  
  const handleFullScreen = () => {
    const isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

    const docElm = frame.current;
    if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
  };

  const handleVR = () => {
    rendererElement.current.requestVR();
    handleFullScreen();
    setToggle(false);
  }

  const handleOnPlayGcode = () => {
    rendererElement.current.handlePlay(editorValue);
  }


  return (
    <div className="App">
      <Navbar navbarHeigth={navbarHeigth} />
      <AppWrapper>
        <div ref={frame} style={{ display: "flex", width: '100%', flexFlow: 'row nowrap', overflow: 'hidden', height: `calc(100% - ${navbarHeigth})` }} >
          <Editor 
            setEditorValue={setEditorValue}
            editorValue={editorValue}
            currentLine={currentLine}
            // onToggle={handleWindowResize}
            setToggle={setToggle}
            toggle={toggle}
            // editorAction={this.handleEditorActions}
            navbarHeigth={navbarHeigth} />
          <div style={{ position: "relative", width: toggle ? 'calc(100% - 350px)': '100%' }} >
            <Renderer
              ref={rendererElement}
              navbarHeigth={navbarHeigth} 
              toggle={toggle}
              style={ {width: '100%'} } />
            <Controls
              handleOnPlayGcode={handleOnPlayGcode}
              handleVR={handleVR}
              handleFullScreen={handleFullScreen} />
          </div>
        </div>
      </AppWrapper>
    </div>
  );
}

export default App;
