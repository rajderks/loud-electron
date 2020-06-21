import React, { FunctionComponent, useEffect } from 'react';
import { updaterGetCRCInfo$ } from '../../util/updater';

const Main: FunctionComponent = () => {
  useEffect(() => {
    updaterGetCRCInfo$().subscribe(
      (n) => {
        console.log(n);
      },
      (e) => {
        console.error(e);
      }
    );
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
