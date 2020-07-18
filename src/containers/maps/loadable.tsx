import React, { Suspense } from 'react';
import Loading from '../../components/Loading';
import Page from '../../components/Page';
import { makeStyles } from '@material-ui/core';

const LoadableComponent = React.lazy(() => import('./index'));

const useStyles = makeStyles(() => ({
  page: {
    flexDirection: 'column',
    overflow: 'hidden',
    maxHeight: '100%',
  },
}));

const MapsLoadable = () => {
  const classes = useStyles();
  return (
    <Page className={classes.page}>
      <Suspense fallback={<Loading />}>
        <LoadableComponent />
      </Suspense>
    </Page>
  );
};

export default MapsLoadable;
