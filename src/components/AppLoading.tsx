import React, { FunctionComponent } from 'react';

const AppLoading: FunctionComponent = () => {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className="loadingImage"
        style={{
          display: 'flex',
          height: 256,
          width: 256,
          backgroundColor: 'transparent',
          backgroundImage: `url('${require('../assets/loud256.png')}')`,
        }}
      />
    </div>
  );
};

export default AppLoading;
