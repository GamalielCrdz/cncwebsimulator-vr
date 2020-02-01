import React, { useState } from "react";
import { Button } from "antd";
import EditorWrapper from "./editor.style";
import AceEditor from "react-ace";
import vrIcon from '../assets/images/vr_icon.svg'

import "ace-builds/src-noconflict/mode-gcode";
import "ace-builds/src-noconflict/theme-xcode";

export default props => {
  const [toggle, setToggle] = useState(true);
  const markers = props.currentLine
    ? [
        {
          startRow: props.currentLine,
          startCol: 0,
          endRow: props.currentLine,
          endCol: 1,
          className: "current-line",
          type: "fullLine"
        }
      ]
    : undefined;
  const actions = ["file-add", "upload", "download", "delete"];
  return (
    <EditorWrapper>
      <div className={`editor-container ${toggle && "show"}`}>
        <AceEditor
          mode="gcode"
          theme="xcode"
          onChange={value => {
            props.setEditorValue(value);
          }}
          value={props.editorValue}
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
                props.editorAction(acti);
              }}
            />
          ))}
        </div>
      </div>
      <div 
        className={`editor-toggle-button ${toggle && "show"}`}      
      >
      <Button
        icon="edit"
        size={"large"}
        onClick={() => {
          setToggle(!toggle);
          props.onToggle(toggle);
        }}
      />
      <Button style={{ maxWidth: '40px', height: '40px', padding: '0px' }} >
        <img src={vrIcon} alt='vr' width={30} height={40}/>
      </Button>
      </div>
    </EditorWrapper>
  );
};
