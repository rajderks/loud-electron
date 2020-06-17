import React, { Suspense } from 'react';
import Loading from '../../components/Loading';
import Page from '../../components/Page';

const LoadableComponent = React.lazy(() => import('./index'));

const MapsLoadable = () => {
  return (
    <Page>
      <Suspense fallback={<Loading />}>
        <LoadableComponent />
      </Suspense>
    </Page>
  );
};

export default MapsLoadable;
