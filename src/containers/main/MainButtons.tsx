import React, { FunctionComponent, useCallback } from 'react';
import { makeStyles, ButtonBase, Typography } from '@material-ui/core';
import { updaterCollectOutOfSyncFiles$ } from '../../util/updater';
import { UpdateStatus } from './constants';
import MainUpdateStatus from './MainUpdateStatus';

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
    color: 'black',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FBFF3A',
  },

  paypalButton: {
    position: 'absolute',
    top: '58.3%',
    left: '72.6%',
    width: 140,
  },
}));

interface Props {
  onUpdate: () => void;
  onRun: () => void;
  onLog: () => void;
  onDonate: () => void;
  updateStatus: UpdateStatus;
}

const indicatorColor = (updateStatus: UpdateStatus) => {
  switch (updateStatus) {
    case UpdateStatus.Failed:
      return 'red';
    case UpdateStatus.UpToDate:
      return 'green';
    default:
      return '#FBFF3A';
  }
};

const MainButtons: FunctionComponent<Props> = ({
  onUpdate,
  onRun,
  onLog,
  onDonate,
  updateStatus,
}) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.buttonWrapper}>
        <div className={classes.updateButtonWrapper}>
          <ButtonBase
            className={classes.button}
            classes={{ root: classes.updateButton }}
            onClick={onUpdate}
          >
            <Typography color="inherit" variant="body2">
              Update
            </Typography>
          </ButtonBase>
          <div
            className={classes.updateIndicator}
            style={{ backgroundColor: indicatorColor(updateStatus) }}
          >
            <MainUpdateStatus updateStatus={updateStatus} />
          </div>
        </div>
        <ButtonBase className={classes.button} onClick={onRun}>
          <Typography color="inherit" variant="body2">
            Run Game
          </Typography>
        </ButtonBase>
        <ButtonBase className={classes.button} onClick={onLog}>
          <Typography color="inherit" variant="body2">
            Updater Log
          </Typography>
        </ButtonBase>
      </div>
      <ButtonBase
        className={classes.paypalButton}
        classes={{ root: classes.button }}
        onClick={onDonate}
      >
        <Typography color="inherit" variant="body2">
          PayPal Donation
        </Typography>
      </ButtonBase>
    </>
  );
};

export default React.memo(MainButtons);
