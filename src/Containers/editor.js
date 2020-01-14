import React, { useState } from "react";
import { Affix, Button, Icon } from "antd";
import EditorWrapper from "./editor.style";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-gcode";
import "ace-builds/src-noconflict/theme-xcode";

export default (props) => {
  const [toggle, setToggle] = useState(false);

  return (
    <EditorWrapper>
      <div className={`editor-container ${toggle && "show"}`}>
        <AceEditor
          mode="gcode"
          theme="xcode"
          onChange={ (value) => { props.setEditorValue(value) }}
          value={props.editorValue}
          //onChange={onChange}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
          className={`editor-area`}
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
