import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  makeStyles,
  Button,
  Typography,
  IconButton,
  darken,
} from '@material-ui/core';
import { UpdateStatus } from './constants';
import MainUpdateStatus from './MainUpdateStatus';
import MainContext from './MainContext';
import { ReactComponent as DiscordLogo } from '../../assets/discord.svg';
import { ReactComponent as PaypalLogo } from '../../assets/paypal.svg';
import api from '../../api/api';
import { logEntry } from '../../util/logger';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  buttonWrapper: {
    display: 'flex',
    backgroundColor: 'transparent',
    width: '100%',
    height: 48,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    transform: 'translateY(8px)',
  },
  updateButtonWrapper: {
    display: 'flex',
    width: 140,
    color: 'white',
    flexWrap: 'wrap',
    transform: 'translateY(-9px)',
  },
  updateButton: {
    flex: '1 1 100%',
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
    borderRadius: 4,
    marginBottom: 2,
  },
  buttonDisabled: {
    color: 'gray',
  },
  mainButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: '0.33 1 auto',
    '& > *': {
      margin: theme.spacing(0, 2, 0, 0),
    },
  },
  rightButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'flex-end',
    '& > *': {
      margin: theme.spacing(0, 2, 0, 0),
    },
  },
  svgButtonWrapper: {
    backgroundColor: darken('#282C31', 0.35),
    borderRadius: 9999,
  },
  disabledFilter: {
    filter: 'grayscale(100%)',
  },
}));

interface Props {
  onUpdate: () => void;
  onRun: () => void;
  onPatchNotes: () => void;
  onMaps: () => void;
  onDonate: (url: string) => void;
  onDiscord: (url: string) => void;
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
  onPatchNotes,
  onMaps,
  onDonate,
  onDiscord,
  updateStatus,
}) => {
  const classes = useStyles();
  const { enabledItems } = useContext(MainContext);
  const [discordURL, setDiscordURL] = useState<string | null>(null);
  const [paypalURL, setPaypalURL] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<string>('static/discord', { responseType: 'text' })
      .subscribe(
        (n) => {
          if (!n || !n.includes('//discord.gg/')) {
            logEntry(`Discord URL could not be fetched`, 'error', [
              'log',
              'main',
              'file',
            ]);
          }
          setDiscordURL(n);
        },
        (e) => {
          logEntry(`Discord URL could not be fetched`, 'error', [
            'log',
            'main',
            'file',
          ]);
          setDiscordURL(null);
        }
      );
  }, []);

  useEffect(() => {
    api
      .get<string>('static/paypal', { responseType: 'text' })
      .subscribe(
        (n) => {
          if (!n || !n.includes('//paypal')) {
            logEntry(`Paypal URL could not be fetched`, 'error', [
              'log',
              'main',
              'file',
            ]);
          }
          setPaypalURL(n);
        },
        (e) => {
          logEntry(`Paypal URL could not be fetched`, 'error', [
            'log',
            'main',
            'file',
          ]);
          setPaypalURL(null);
        }
      );
  }, []);

  return (
    <>
      <div className={classes.buttonWrapper}>
        <div className={classes.mainButtonContainer}>
          <div className={classes.updateButtonWrapper}>
            <div
              className={classes.updateIndicator}
              style={{ backgroundColor: indicatorColor(updateStatus) }}
            >
              <MainUpdateStatus updateStatus={updateStatus} />
            </div>
            <Button
              classes={{
                root: classes.updateButton,
                disabled: classes.buttonDisabled,
              }}
              onClick={onUpdate}
              color="secondary"
              variant="contained"
            >
              <Typography color="inherit" variant="body2">
                <strong>
                  {updateStatus === UpdateStatus.CleanInstall
                    ? 'Install'
                    : 'Update'}
                </strong>
              </Typography>
            </Button>
          </div>
          <Button
            classes={{ disabled: classes.buttonDisabled }}
            onClick={onRun}
            disabled={
              (updateStatus !== UpdateStatus.UpToDate &&
                updateStatus !== UpdateStatus.NotChecked) ||
              !enabledItems.includes('run')
            }
            color="secondary"
            variant="contained"
          >
            <Typography color="inherit" variant="body2">
              <strong>Run Game</strong>
            </Typography>
          </Button>
        </div>

        <div className={classes.rightButtonContainer}>
          <Button
            classes={{ disabled: classes.buttonDisabled }}
            onClick={onMaps}
            color="secondary"
            variant="contained"
          >
            <Typography color="inherit" variant="body2">
              <strong>Map library</strong>
            </Typography>
          </Button>
          <Button onClick={onPatchNotes} color="secondary" variant="contained">
            <Typography color="inherit" variant="body2">
              <strong>Patch Notes</strong>
            </Typography>
          </Button>
          <div
            className={clsx(
              { [classes.disabledFilter]: !discordURL },
              classes.svgButtonWrapper
            )}
          >
            <IconButton
              disabled={!discordURL}
              style={{ height: 78, width: 78 }}
              onClick={() => {
                if (discordURL) {
                  onDiscord(discordURL);
                }
              }}
            >
              <DiscordLogo width="72" height="72" />
            </IconButton>
          </div>
          <div className={classes.svgButtonWrapper}>
            <IconButton
              style={{ height: 78, width: 78 }}
              onClick={() => {
                if (paypalURL) {
                  onDonate(paypalURL);
                }
              }}
            >
              <PaypalLogo width="72" height="72" />
            </IconButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(MainButtons);
