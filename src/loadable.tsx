// @ts-ignore

/**
 * Combat weird pop-in of fonts and such by giving it a minimal delay.
 */
import React, { Suspense } from 'react';
import AppLoading from './components/AppLoading';

const LoadableComponent = React.lazy(() => {
  const urlTail = require('electron')
    .remote.getCurrentWebContents()
    .getURL()
    .split('/')
    .pop();
  const timeout = urlTail?.includes('index') ? 2000 : 0;
  return Promise.all([
    import('./App'),
    new Promise((res) => setTimeout(res, timeout)),
  ]).then(([moduleExports]) => moduleExports) as any;
});

const AppLoadable = () => {
  const urlTail = require('electron')
    .remote.getCurrentWebContents()
    .getURL()
    .split('/')
    .pop();
  const Fallback = urlTail?.includes('index') ? AppLoading : null;
  return (
    <Suspense fallback={Fallback ? <Fallback /> : null}>
      <LoadableComponent />
    </Suspense>
  );
};

export default AppLoadable;
