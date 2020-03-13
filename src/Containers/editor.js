import React, { useState, useRef } from "react";
import { Button } from "antd";
import EditorWrapper from "./editor.style";
import AceEditor from "react-ace";
import vrIcon from "../assets/images/vr_icon.svg";

import "ace-builds/src-noconflict/mode-gcode";
import "ace-builds/src-noconflict/theme-xcode";

export default function Editor({
  currentLine,
  toggle,
  editorValue,
  setEditorValue,
  setToggle,
  editorAction
}) {
  const inputFile = useRef(null);
  const downloadLink = useRef(null);
  const actions = ["file-add", "upload", "download", "delete"];
  const markers = currentLine ? 
    [{startRow: currentLine,startCol: 0, endRow: currentLine,endCol: 1,className: "current-line",type: "fullLine"}]
    : undefined;

  const handleEditorActions = action => {
    switch (action) {
      case "file-add":
        setEditorValue(
          "%\nG21 G90 G40 G98\nG54\nT01\nS1200 M03\n\n\nM5\nM30\n\n"
        );
        break;
      case "upload":
        inputFile.current.click();
        break;
      case "download":
        const textFileAsBlob = new Blob([editorValue], {
          encoding: "UTF-8",
          type: "text/plain;charset=UTF-8"
        });
        downloadLink.current.download = "gcode.txt";
        downloadLink.current.innerHTML = "Download File";
        if (window.webkitURL != null) {
          downloadLink.current.href = window.webkitURL.createObjectURL(textFileAsBlob);
        } else {
          downloadLink.current.href = window.URL.createObjectURL(textFileAsBlob);
        }
        downloadLink.current.click();
        break;
      case "delete":
        setEditorValue('');
        break;

      default:
        break;
      }
      editorAction && editorAction(action);
  };

  const onGFileUpload = event => {
    let files = event.target.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      const gcode = reader.result;
      setEditorValue(gcode);
    };

    reader.readAsText(files);
  };


  return (
    <EditorWrapper>
      <input type='file' onChange={(e) => {console.log('eeeeeeeee');onGFileUpload(e)}} ref={inputFile} style={{ display: 'none' }}  />
      <a ref={downloadLink} style={{display: 'none'}}  >Download gcode file</a>
      <div className={`editor-container ${toggle && "show"}`}>
        <AceEditor
          mode="gcode"
          theme="xcode"
          onChange={value => {
            setEditorValue(value);
          }}
          value={editorValue}
          name="GCODE-EDITOR"
          highlightActiveLine={true}
          className={`editor-area`}
          markers={markers}
        />
        <div className="editor-actions">
          {actions.map(acti => (
            <Button
              key={acti}
              icon={acti}
              title={acti}
              onClick={() => {
                handleEditorActions(acti);
              }}
            />
          ))}
        </div>
      </div>
      <div className={`editor-toggle-button ${toggle && "show"}`}>
        <Button
          icon="edit"
          size={"large"}
          onClick={() => {
            setToggle(!toggle);
          }}
        />
      </div>
    </EditorWrapper>
  );
}
