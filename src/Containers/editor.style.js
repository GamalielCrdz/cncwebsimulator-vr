import styled from "styled-components";

const editorWrapper = styled.div`
  position: absolute;
  height: 90%;
  display: flex;
  flex-flow: row nowrap;

  .editor-container {
    margin-left: -350px;
    transition: margin-left 2s;
    height: 100%;
    &.show {
      margin: 0px;
    }
    .editor-area {
      height: 100%!important;
      width: 350px!important;
    }
  }

  .editor-toggle-button {

  }

  @media only screen and (max-width: 768px) {
    
  }
`;
export default editorWrapper;
