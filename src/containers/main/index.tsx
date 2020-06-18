import React, { FunctionComponent, useEffect } from 'react';
import { getCRCInfo } from '../../util/updater';

const Main: FunctionComponent = () => {
  useEffect(() => {
    getCRCInfo()
      .then((n) => {
        console.log(n);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);
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
