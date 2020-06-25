// @ts-ignore

/**
 * Combat weird pop-in of fonts and such by giving it a minimal delay.
 */
import React, { Suspense } from 'react';
import AppLoading from './components/AppLoading';

const LoadableComponent = React.lazy(() => {
  return Promise.all([
    import('./App'),
    new Promise((res) => setTimeout(res, 2000)),
  ]).then(([moduleExports]) => moduleExports) as any;
});

const AppLoadable = () => {
  return (
    <Suspense fallback={<AppLoading />}>
      <LoadableComponent />
    </Suspense>
  );
};

export default AppLoadable;
