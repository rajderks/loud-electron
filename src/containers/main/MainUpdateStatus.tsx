import React, { FunctionComponent, useEffect, useState } from 'react';
import { UpdateStatus } from './constants';
import { Typography, makeStyles } from '@material-ui/core';
import {
  MainLogDownloadFilePercentageStatusSubject,
  MainLogDownloadFileProgressStatusSubject,
} from './observables';

interface Props {
  updateStatus: UpdateStatus;
}

const useStyles = makeStyles(() => ({
  updateIndicatorWrapper: {
    position: 'absolute',
    flex: '1 1 100%',
    maxWidth: 140,
    height: '100%',
    backgroundColor: '#FBFF3A',
    borderRadius: 4,
  },
  updateIndicatorText: {
    fontWeight: 'bold',
    zIndex: 1,
    margin: '0 auto',
  },
}));

const updateStatusMessage = (
  updateStatus: UpdateStatus,
  progress: string | null
) => {
  switch (updateStatus) {
    case UpdateStatus.CleanInstall:
      return 'Clean install';
    case UpdateStatus.Unpacking:
      return 'Unpacking';
    case UpdateStatus.Failed:
      return 'Failed';
    case UpdateStatus.UpToDate:
      return 'Up to date';
    case UpdateStatus.Updating:
      return progress ? `Updating (${progress})` : 'Updating';
    case UpdateStatus.CRC:
      return 'Checking';
    case UpdateStatus.NotChecked:
    default:
      return 'Not checked';
  }
};

const MainUpdateStatus: FunctionComponent<Props> = ({ updateStatus }) => {
  const classes = useStyles();
  const [updaterPercentage, setUpdaterPercentage] = useState<number | null>(
    null
  );
  const [updaterProgressLabel, setUpdaterProgressLabel] = useState<
    string | null
  >(null);

  useEffect(() => {
    const subPerc = MainLogDownloadFilePercentageStatusSubject.subscribe(
      (n) => {
        setUpdaterPercentage(n);
      }
    );
    const subProg = MainLogDownloadFileProgressStatusSubject.subscribe((n) => {
      setUpdaterProgressLabel(n.join(' / '));
    });
    return () => {
      if (subPerc) {
        subPerc.unsubscribe();
      }
      if (subProg) {
        subProg.unsubscribe();
      }
    };
  }, []);

  return (
    <>
      <div
        className={classes.updateIndicatorWrapper}
        style={{
          backgroundColor: 'green',
          width: `${updaterPercentage ?? 0}%`,
        }}
      ></div>
      <Typography
        classes={{ root: classes.updateIndicatorText }}
        color="inherit"
        variant="caption"
      >
        {updateStatusMessage(updateStatus, updaterProgressLabel)}
      </Typography>
    </>
  );
};

export default React.memo(MainUpdateStatus);
