import React, { useState } from "react";
import styled from "styled-components";
import { Button, Slider } from "antd";

const Container = styled.div`
  height: 60px;
  width: 210px;
  background-color: rgba(33, 91, 51, 0.56);
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  margin: auto;
  margin-left: 350;
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
        style={{ width: "100%", maxWidth: "190px", margin: 0 }}
        min={0}
        max={100}
        defaultValue={0}
        value={props.sliderValue}
        onChange={props.onChangeSlider}
      />
      <Button
        icon={play ? "play-circle" : "pause-circle"}
        size="large"
        shape="circle"
        onClick={() => {
          setPlay(!play);
          props.onPlay(play);
        }}
      />
    </Container>
  );
};
