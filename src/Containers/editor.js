import React, { useState } from "react";
import { Button } from "antd";
import EditorWrapper from "./editor.style";
import AceEditor from "react-ace";

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
      <Button
        className={`editor-toggle-button ${toggle && "show"}`}
        icon="edit"
        size={"large"}
        onClick={() => {
          setToggle(!toggle);
          props.onToggle(toggle);
        }}
      />
    </EditorWrapper>
  );
};
