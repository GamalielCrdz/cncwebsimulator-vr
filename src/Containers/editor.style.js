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
      height: calc(100% - 50px)!important;
      width: 350px!important;
    }
    .editor-actions {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-evenly;
      width: 100%;
      background-color: rgba(33, 91, 51, 0.8);
      height: 50px;
      padding: 9px;
    }
  }

  .editor-toggle-button {
    display: flex;
    flex-flow: column nowrap;
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