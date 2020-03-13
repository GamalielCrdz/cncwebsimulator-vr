import React, { useState } from "react";
import styled from "styled-components";
import { Button, Slider, Tooltip } from "antd";
import vrIcon from '../assets/images/vr.svg'

const Container = styled.div`
  height: 60px;
  width: calc(100% - 10px);
  background-color: rgba(0, 0, 0, 0.56);
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  margin: auto;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

export default props => {
  const [play, setPlay] = useState(true);
  return (
    <Container>
      <Slider
        style={{ width: "100%", maxWidth: "calc(100% - 30px)", margin: 0 }}
        min={0}
        max={100}
        defaultValue={0}
        value={props.sliderValue}
        onChange={props.onChangeSlider}
      />
      <div style={{ width: 'calc(100% - 30px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >

      <Tooltip title={'vr'} >
      <Button style={{ width: '32px', height: '32px', padding: '0px' }} onClick={props.handleVR} >
        <img src={vrIcon} alt='vr' width={22} height={26}/>
      </Button>
      </Tooltip>

      <Button
        icon={play ? "play-circle" : "pause-circle"}
        size="large"
        shape="circle"
        onClick={() => {
          setPlay(!play);
          props.handleOnPlayGcode(play);
        }}
      />

      <Tooltip title={'fullscreen'} >
        <Button
          icon={'fullscreen'}
          onClick={props.handleFullScreen}
        />
      </Tooltip>
      </div>
    </Container>
  );
};
