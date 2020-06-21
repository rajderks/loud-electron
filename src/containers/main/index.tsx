import React, { FunctionComponent } from 'react';

const Main: FunctionComponent = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: `url('${require('../../assets/LoudTerminator.png')}')`,
        backgroundSize: 'cover',
      }}
    >
      Test
    </div>
  );
};

export default Main;
