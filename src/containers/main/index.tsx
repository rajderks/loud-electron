import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
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

const Main: FunctionComponent = () => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(
    UpdateStatus.NotChecked
  );
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
        }
      );
  }, []);

  const handleRun = () => {
    rungame();
  };

  const handleLog = () => {};

  const handleDonate = () => {};

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
    logEntry(
      `base uri: ${BASE_URI} (if this doesn't match your SupCom directory, file a bug report in discord and quit the client)`,
      'log',
      ['log', 'file', 'main']
    );
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
    </div>
  );
};

export default Main;
