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
          //onChange={onChange}
          name="GCODE-EDITOR"
          editorProps={{ $blockScrolling: true }}
          highlightActiveLine={true}
          className={`editor-area`}
          markers={markers}
        />
      </div>
      <Button
        className="editor-toggle-button"
        icon="edit"
        size={"large"}
        onClick={() => {
          setToggle(!toggle);
        }}
      />
    </EditorWrapper>
  );
};
