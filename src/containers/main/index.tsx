import React, { FunctionComponent } from 'react';
import MainButtons from './MainButtons';

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
      <MainButtons />
    </div>
  );
};

export default Main;
