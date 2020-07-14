import React, { FunctionComponent } from 'react';
import Page from './Page';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: '1 1 100%',
    height: '100%',
  },
  page: {
    backgroundColor: 'inherit',
  },
}));

const Loading: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Page className={classes.page}>
      <div className={classes.wrapper}>
        <div
          className="loadingImage"
          style={{
            display: 'flex',
            height: 256,
            width: 256,
            backgroundImage: `url('${require('../assets/loud256.png')}')`,
          }}
        />
      </div>
    </Page>
  );
};

export default Loading;
