import React, { useEffect, useState } from 'react';
import {
  Dialog,
  Typography,
  LinearProgress,
  makeStyles,
} from '@material-ui/core';
import checkClientUpdate$ from '../../util/checkClientUpdate';
import { fromFetch } from 'rxjs/fetch';
import { logEntry } from '../../util/logger';
import updateRestart, { updateRestartCleanup } from '../../util/updateRestart';
import { apiBaseURI } from '../../api/api';

const useStyles = makeStyles((theme) => ({
  root: {
    background: 'transparent',
  },
  paper: {
    background: 'transparent',
    borderRadius: 0,
  },
  bar: {
    marginTop: theme.spacing(1),
    borderRadius: 99,
  },
}));

interface Props {
  url: string;
}

const MainUpdateDialog = () => {
  const classes = useStyles();
  const [updateURL, setUpdateURL] = useState<string | null>(null);
  useEffect(() => {
    checkClientUpdate$().subscribe(
      (n) => {
        if (n) {
          setUpdateURL(n);
        }
      },
      () => {
        updateRestartCleanup();
      }
    );
  }, []);
  useEffect(() => {
    // Due to a CORS bug in the githup domain, we can't download from there.
    // For now, retrieve it from the server.
    if (updateURL) {
      fromFetch(`${apiBaseURI}/release`).subscribe(
        async (n) => {
          const blob = await n.arrayBuffer();
          try {
            updateRestart(new Buffer(new Uint8Array(blob)));
          } catch (_) {
            setUpdateURL(null);
          }
        },
        (e) => {
          logEntry(`Auto-update failed: ${e}`, 'error', ['file', 'log']);
          logEntry(
            'Could not auto-update. Please post the loud_log.txt in Discords #bug-report channel.',
            'error',
            ['main']
          );
          setUpdateURL(null);
        }
      );
    }
  }, [updateURL]);
  return (
    <Dialog
      classes={{ root: classes.root, paper: classes.paper }}
      open={!!updateURL}
    >
      <Typography>
        Updating to latest version, this may take a few minutes
      </Typography>
      <LinearProgress className={classes.bar} color="secondary" />
    </Dialog>
  );
};

export default MainUpdateDialog;
