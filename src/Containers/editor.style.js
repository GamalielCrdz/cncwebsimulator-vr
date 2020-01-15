import styled from "styled-components";

const editorWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: row nowrap;

  .editor-container {
    margin-left: -350px;
    transition: margin-left 1s;
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
    z-index: 2;
    position: absolute;
    left: 0px;
    transition: left 1s;
    &.show {
      left: 350px;
    }
  }

  @media only screen and (max-width: 768px) {
    
  }
`;
export default editorWrapper;
