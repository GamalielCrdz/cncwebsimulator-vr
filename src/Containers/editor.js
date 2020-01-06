import React from 'react'
import { Affix, Button } from 'antd';

export default () => {
  return (
    <div style={{ position: "absolute", color: "red" }}>
      <Affix offsetTop={10}>
          <Button
            type="primary"
            onClick={() => {
              this.setState({
                top: 10 + 10,
              });
            }}
          >
            Affix top
          </Button>
        </Affix>
    </div>
  )
}
