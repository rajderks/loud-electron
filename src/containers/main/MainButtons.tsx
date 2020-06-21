import React, { FunctionComponent, useCallback } from 'react';
import { makeStyles, ButtonBase, Typography } from '@material-ui/core';
import { updaterCollectOutOfSyncFiles$ } from '../../util/updater';

const useStyles = makeStyles((theme) => ({
  buttonWrapper: {
    display: 'flex',
    position: 'absolute',
    top: '58.3%',
    left: '12.70%',
    backgroundColor: 'transparent',
    width: 442,
    height: 40,
    color: 'white',
    justifyContent: 'space-between',
  },
  updateButtonWrapper: {
    display: 'flex',
    width: 140,
    height: 40,
    color: 'white',
    flexWrap: 'wrap',
  },
  button: {
    height: 40,
    display: 'flex',
    flex: '0 0 140px',
    border: '1px solid #EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    color: 'white',
  },
  updateButton: {
    height: 25,
  },
  updateIndicator: {
    height: 15,
    flex: '0 0 100%',
    backgroundColor: '#FBFF3A',
    color: 'black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateIndicatorText: {
    fontWeight: 'bold',
  },
  paypalButton: {
    position: 'absolute',
    top: '58.3%',
    left: '72.6%',
    width: 140,
  },
}));

const MainButtons: FunctionComponent = () => {
  const classes = useStyles();
  const handleFloep = useCallback(() => {
    const fileInfos = require('../../util/__tests__/test-crc-fileinfo.json');
    updaterCollectOutOfSyncFiles$(
      fileInfos,
      `${process.env.REACT_APP_FS_BASE_URL!}/LOUD`
    ).subscribe((n) => {
      console.log('finished', n);
    });
  }, []);
  return (
    <>
      <div className={classes.buttonWrapper}>
        <div className={classes.updateButtonWrapper}>
          <ButtonBase
            className={classes.button}
            classes={{ root: classes.updateButton }}
            onClick={() => {
              handleFloep();
            }}
          >
            <Typography color="inherit" variant="body2">
              Update
            </Typography>
          </ButtonBase>
          <div className={classes.updateIndicator}>
            <Typography
              classes={{ root: classes.updateIndicatorText }}
              color="inherit"
              variant="caption"
            >
              Not checked
            </Typography>
          </div>
        </div>
        <ButtonBase className={classes.button} onClick={() => {}}>
          <Typography color="inherit" variant="body2">
            Run Game
          </Typography>
        </ButtonBase>
        <ButtonBase className={classes.button} onClick={() => {}}>
          <Typography color="inherit" variant="body2">
            Updater Log
          </Typography>
        </ButtonBase>
      </div>
      <ButtonBase
        className={classes.paypalButton}
        classes={{ root: classes.button }}
        onClick={() => {}}
      >
        <Typography color="inherit" variant="body2">
          PayPal Donation
        </Typography>
      </ButtonBase>
    </>
  );
};

export default MainButtons;
