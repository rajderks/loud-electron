import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import MainButtons from './MainButtons';
import {
  updaterCollectOutOfSyncFiles$,
  updaterGetCRCInfo$,
  updaterParseRemoteFileContent,
  updaterGetAndWriteRemoteFiles$,
} from '../../util/updater';
import { UpdateStatus } from './constants';
import { logEntry } from '../../util/logger';
import { switchMap, tap } from 'rxjs/operators';
import { iif, EMPTY } from 'rxjs';
import { RemoteFileInfo } from '../../util/types';
import MainLog from './MainLog';
import { BASE_URI } from '../../constants';
import rungame from '../../util/rungame';
import checkFolder from '../../util/checkFolder';
import electron from 'electron';
import testWrite from '../../util/testWrite';
import createUserDirectories from '../../util/createUserDirectories';
import MainContext from './MainContext';
import { Typography, makeStyles } from '@material-ui/core';
import openTarget, { openTargetCheck, targetURI } from '../../util/openTarget';
import createDocumentsDirectories$ from '../../util/createDocumentsDirectories';
import checkClientUpdate$ from '../../util/checkClientUpdate';
import { exec } from 'child_process';

const useStyles = makeStyles((theme) => ({
  userContentWrapper: {
    position: 'absolute',
    bottom: 0,
    right: theme.spacing(0.5),
    color: 'white',
    width: 250,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userContentLabel: {
    fontWeight: theme.typography.fontWeightLight,
    fontSize: theme.typography.fontSize * 0.9,
  },
}));

const Main: FunctionComponent = () => {
  const classes = useStyles();
  const { enabledItems, changeEnabledItem } = useContext(MainContext);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(
    UpdateStatus.NotChecked
  );

  useEffect(() => {
    checkFolder().subscribe(
      () => {
        logEntry('Client is in correct folder', 'log', ['file']);
      },
      (e) => {
        logEntry('Client is not in correct folder', 'error', ['file']);
        electron.remote.dialog.showErrorBox(
          'Error!',
          'Please put the client in the root of your Supreme Commander folder i.e. C:\\SteamLibrary\\steamapps\\common\\Supreme Commander Forged Alliance'
        );
        electron.remote.app.quit();
      }
    );
    testWrite().subscribe(
      () => {
        logEntry('Test write succeeded', 'log', ['main', 'file']);
      },
      (e) => {
        logEntry(`Could not write/unlink test file ${e}`, 'error', ['file']);
        electron.remote.dialog.showErrorBox(
          'Error!',
          'Could not write test file. Please run the client as administrator and/or make sure the game folder is not read-only'
        );
        electron.remote.app.quit();
      }
    );
    createUserDirectories();
  }, []);

  const handleUpdate = useCallback(() => {
    setUpdateStatus(UpdateStatus.CRC);
    updaterGetCRCInfo$()
      .pipe(
        switchMap((crcInfo) =>
          updaterCollectOutOfSyncFiles$(
            updaterParseRemoteFileContent(crcInfo),
            BASE_URI,
            {
              channels: ['file'],
            }
          )
        ),
        tap((n) => {
          if (n.length === 0) {
            logEntry(`All files up to date`, 'log');
            setUpdateStatus(UpdateStatus.UpToDate);
          } else if (n.length > 1) {
            logEntry(
              `Files out of sync:\r\n${n.map((m) => `${m.path}\r\n`)}`,
              'log'
            );
            setUpdateStatus(UpdateStatus.Updating);
          }
        }),
        switchMap((outOfSyncFileInfos) =>
          iif<never, [RemoteFileInfo[], RemoteFileInfo[]]>(
            () => outOfSyncFileInfos.length === 0,
            EMPTY,
            updaterGetAndWriteRemoteFiles$(BASE_URI, outOfSyncFileInfos)
          )
        )
      )
      .subscribe(
        (n) => {
          const [success, failed] = n;
          if (failed.length) {
            logEntry(
              `Failed to download files: ${failed.map((fi) => fi.path)}`,
              'error'
            );
            setUpdateStatus(UpdateStatus.Failed);
          }
          if (success.length) {
            logEntry(
              `Succesfully downloaded/overwritten files: ${success.map(
                (fi) => fi.path
              )}`,
              'log'
            );
            setUpdateStatus(UpdateStatus.UpToDate);
          }
        },
        (e) => {
          logEntry(`Main:handleUpdate:: ${e}`, 'error');
          setUpdateStatus(UpdateStatus.Failed);
        },
        () => {
          setUpdateStatus(UpdateStatus.UpToDate);
          openTargetCheck('datapathlua').subscribe((n) => {
            changeEnabledItem('louddatapathlua', n);
          });
          openTargetCheck('loud').subscribe((n) => {
            changeEnabledItem('run', n);
          });
          createDocumentsDirectories$().subscribe(([target, created]) => {
            if (target === 'maps') {
              changeEnabledItem('open-maps', created);
            }
            if (target === 'mods') {
              changeEnabledItem('open-mods', created);
            }

            if (target === 'replays') {
              changeEnabledItem('open-replays', created);
            }
            if (created) {
              logEntry(`Created ${target} folder, or it already existed`);
            } else {
              logEntry(
                `Could not create ${target} folder ${targetURI(target)}`,
                'error'
              );
            }
          });
          openTargetCheck('log').subscribe((n) => {
            changeEnabledItem('log', n);
          });
          openTargetCheck('gamelog').subscribe((n) => {
            changeEnabledItem('help-gamelog', n);
          });
          openTargetCheck('help').subscribe((n) => {
            changeEnabledItem('help-help', n);
          });
          openTargetCheck('info').subscribe((n) => {
            changeEnabledItem('help-info', n);
          });
          openTargetCheck('datapathlua').subscribe((n) => {
            changeEnabledItem('louddatapathlua', n);
          });
          openTargetCheck('loud').subscribe((n) => {
            if (!n) {
              logEntry('LOUD is not install. Press the update button!');
            }
            changeEnabledItem('run', n);
          });
        }
      );
  }, [changeEnabledItem]);

  const handleRun = () => {
    rungame();
  };

  const handleLog = () => {
    openTarget('log');
  };

  const handleDonate = () => {
    openTarget('patreon');
  };

  useEffect(() => {
    switch (updateStatus) {
      case UpdateStatus.CRC: {
        break;
      }
      case UpdateStatus.Updating: {
        break;
      }
      case UpdateStatus.Failed:
      case UpdateStatus.NotChecked:
      case UpdateStatus.UpToDate:
      default:
        return;
    }
  }, [updateStatus]);

  useEffect(() => {
    checkClientUpdate$().subscribe((n) => {
      console.log(n);
      if (n) {
        electron.remote.dialog
          .showMessageBox({
            type: 'info',
            defaultId: 1,
            buttons: ['no', 'yes'],
            message:
              'A new version is available. Do you want to download it now?',
            cancelId: 0,
          })
          .then(({ response }) => {
            if (response === 1) {
              exec(`start ${n}`, (err) => {
                if (err) {
                  logEntry(`${err}`, 'error');
                  return;
                }
                electron.remote.app.quit();
              });
            }
          });
      }
    });
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: `url('${require('../../assets/LoudTerminator.png')}')`,
        backgroundSize: 'cover',
      }}
    >
      <MainButtons
        updateStatus={updateStatus}
        onUpdate={handleUpdate}
        onRun={handleRun}
        onLog={handleLog}
        onDonate={handleDonate}
      />
      <MainLog key="main-log" />
      <div className={classes.userContentWrapper}>
        <Typography
          display="inline"
          variant="body2"
          className={classes.userContentLabel}
          style={{
            color: enabledItems.includes('maps') ? 'red' : 'white',
          }}
        >{`User maps: ${
          enabledItems.includes('maps') ? 'enabled' : 'disabled'
        }`}</Typography>
        <Typography
          display="inline"
          variant="body2"
          className={classes.userContentLabel}
          style={{
            color: enabledItems.includes('mods') ? 'red' : 'white',
          }}
        >{`User mods: ${
          enabledItems.includes('mods') ? 'enabled' : 'disabled'
        }`}</Typography>
      </div>
    </div>
  );
};

export default Main;
