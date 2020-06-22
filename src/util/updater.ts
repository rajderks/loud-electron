import fs from 'fs';
import ftp from 'jsftp';
import crypto from 'crypto';
import { RemoteFileInfo, LogConfig } from './types';
import { of, from, defer, Observable, iif, EMPTY } from 'rxjs';
import {
  map,
  catchError,
  toArray,
  mergeMap,
  concatMap,
  tap,
} from 'rxjs/operators';
import { logEntry } from './logger';
import {
  MainLogDownloadFilePercentageStatusSubject,
  MainLogDownloadFileProgressStatusSubject,
} from '../containers/main/observables';

interface FTP extends ftp {
  auth(
    name: string,
    pass: string,
    callback: (err: Error | undefined) => void
  ): void;
}

const connection = {
  host: process.env.REACT_APP_FTP_HOST,
  user: process.env.REACT_APP_FTP_USER,
  pass: process.env.REACT_APP_FTP_PASS,
};

const defaultLogConfig: LogConfig = {
  channels:
    (process.env.REACT_APP_LOG_CONFIG_CHANNELS?.split(',').map((x) =>
      x.trim()
    ) as LogConfig['channels']) ?? [],
};

const updaterConnectFTP$ = () =>
  from<Promise<FTP>>(
    new Promise((res, rej) => {
      const client: FTP = new ftp(connection) as FTP;
      client.on('connect', (err) => {
        if (err) {
          throw err;
        }
        client.auth(connection.user!, connection.pass!, (errAuth) => {
          if (errAuth) {
            throw errAuth;
          }
          res(client);
        });
      });
    })
  );

const updaterGetCRCInfo$ = (logConfig: LogConfig = defaultLogConfig) =>
  from<Promise<string>>(
    new Promise((res) => {
      const client: FTP = new ftp(connection) as FTP;
      client.on('connect', (errReady) => {
        if (errReady) {
          logEntry(
            `updaterGetCRCInfo$:connect:: ${errReady}`,
            'error',
            logConfig.channels
          );
          throw errReady;
        }
        client.auth(connection.user!, connection.pass!, (errAuth) => {
          if (errAuth) {
            logEntry(
              `updaterGetCRCInfo$:auth:: ${errAuth}`,
              'error',
              logConfig.channels
            );
            throw errAuth;
          }
          logEntry(
            `updaterGetCRCInfo$:auth:: success`,
            'log',
            logConfig.channels
          );
          client.get('LOUD/SCFA_FileInfo.txt', (err, socket) => {
            if (err) {
              logEntry(
                `updaterGetCRCInfo$:get:: ${err}`,
                'error',
                logConfig.channels
              );
              throw err;
            }
            let str = '';
            socket.on('data', (d) => {
              str += d;
            });

            socket.on('close', (errClose) => {
              if (errClose) {
                logEntry(
                  `updaterGetCRCInfo$:close:: ${err}`,
                  'error',
                  logConfig.channels
                );
                throw errClose;
              }
              logEntry(
                `updaterGetCRCInfo$:get:: success`,
                'log',
                logConfig.channels
              );
              res(str);
            });
            socket.resume();
          });
        });
      });
    })
  );

const updaterGetRemoteFile$ = (
  fileInfo: RemoteFileInfo,
  client: FTP,
  logConfig: LogConfig = defaultLogConfig
) => {
  return from<Promise<Buffer>>(
    new Promise((res, rej) => {
      client.get(`LOUD/${fileInfo.path}`, (err, socket) => {
        if (err) {
          logEntry(
            `updaterGetRemoteFile$:get:: ${err}`,
            'error',
            logConfig.channels
          );
          throw err;
        }
        logEntry(
          `updaterGetRemoteFile$:start:: ${fileInfo.path}, ${fileInfo.size}`,
          'log',
          logConfig.channels
        );
        MainLogDownloadFilePercentageStatusSubject.next(0);
        let buffer = Buffer.from('');
        socket.on('data', (d) => {
          buffer = Buffer.concat([buffer, d]);
          MainLogDownloadFilePercentageStatusSubject.next(
            Math.floor((buffer.byteLength / fileInfo.size) * 100)
          );
        });

        socket.on('close', (errClose) => {
          if (errClose) {
            logEntry(
              `updaterGetRemoteFile$:close:: ${err}`,
              'error',
              logConfig.channels
            );
            throw errClose;
          }
          res(buffer);
        });
        socket.resume();
      });
    })
  );
};

const updaterGetAndWriteRemoteFiles$ = (
  baseURI: string,
  fileInfos: RemoteFileInfo[],
  logConfig: LogConfig = defaultLogConfig
): Observable<[RemoteFileInfo[], RemoteFileInfo[]]> => {
  return new Observable((subscriber) => {
    const filesSucceeded: RemoteFileInfo[] = [];
    const filesFailed: RemoteFileInfo[] = [];
    return updaterConnectFTP$().subscribe(
      (c) => {
        from(fileInfos)
          .pipe(
            concatMap((fileInfo, fii) =>
              updaterGetRemoteFile$(fileInfo as RemoteFileInfo, c).pipe(
                tap(() => {
                  MainLogDownloadFileProgressStatusSubject.next([
                    fii,
                    fileInfos.length,
                  ]);
                }),
                mergeMap((buffer, i) =>
                  updaterWriteBufferToLocalFile$(
                    baseURI,
                    fileInfo,
                    buffer,
                    logConfig
                  ).pipe(
                    map((fi) => {
                      return [fi, true] as [RemoteFileInfo, boolean];
                    })
                  )
                ),
                catchError((e) => {
                  logEntry(
                    `updaterGetAndWriteRemoteFiles$:: ${e}`,
                    'error',
                    logConfig.channels
                  );
                  return of([fileInfo, false] as [RemoteFileInfo, boolean]);
                })
              )
            )
          )
          .subscribe(
            ([fileInfo, success]) => {
              if (success) {
                filesSucceeded.push(fileInfo);
              } else {
                filesFailed.push(fileInfo);
              }
            },
            (e) => {
              logEntry(`updaterGetAndWriteRemoteFiles$::inner: ${e}`);
            },
            () => {
              subscriber.next([filesSucceeded, filesFailed]);
              subscriber.complete();
            }
          );
      },
      (e) => {
        logEntry(`updaterGetAndWriteRemoteFiles$::outer: ${e}`);
        subscriber.error(e);
      }
    );
  });
};

const updaterWriteBufferToLocalFile$ = (
  uri: string,
  fileInfo: RemoteFileInfo,
  buffer: Buffer,
  logConfig: LogConfig = defaultLogConfig
) => {
  return from(
    new Promise<RemoteFileInfo>((res, rej) => {
      const path = updaterCreateLocalFileURI(uri, fileInfo.path);
      const dir = updateCreateLocalFileDirURI(path);
      logEntry(
        `Writing file ${path}, ${fileInfo.size}`,
        'log',
        logConfig.channels
      );
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          logEntry(
            `updaterWriteBufferToLocalFile$:mkdir::${fileInfo.path},${buffer.length} / ${err}`,
            'error',
            logConfig.channels
          );
          throw err;
        }
        fs.writeFile(path, buffer, (errWrite) => {
          if (errWrite) {
            logEntry(
              `updaterWriteBufferToLocalFile$:mkdir::${fileInfo.path},${buffer.length} / ${errWrite}`,
              'error',
              logConfig.channels
            );
            throw errWrite;
          }

          logEntry(
            `updaterWriteBufferToLocalFile$:done::${fileInfo.path},${buffer.length}`,
            'log',
            logConfig.channels
          );
          res(fileInfo);
        });
      });
    })
  );
};

const updaterParseRemoteFileContent = (
  remoteFileContent: string
): RemoteFileInfo[] =>
  remoteFileContent
    .replace(/\\+/gi, '/')
    .replace(/^\s+|\s+$/g, '')
    .split(/\r?\n/)
    .map((line) => updaterStringToRemoteFileInfo(line));

const updaterStringToRemoteFileInfo = (fileEntry: string): RemoteFileInfo => {
  const fixedFileEntry = fileEntry.replace('\\', '/').trim();
  const [path, hexsha, size] = fixedFileEntry.split(',');

  return {
    path,
    hash: hexsha.substr(2),
    size: Number.parseInt(size),
  };
};

const updaterLocalFileData$ = (
  path: string,
  logConfig: LogConfig = defaultLogConfig
): Observable<Buffer> =>
  defer(() =>
    from<Promise<Buffer>>(
      new Promise((res, rej) => {
        fs.readFile(path, (err, data) => {
          if (err) {
            logEntry(`${err}`, 'error', logConfig.channels);
            rej(err);
          }
          res(data);
        });
      })
    )
  );

const updaterCreateLocalFileURI = (baseURI: string, path: string) =>
  `${baseURI}/LOUD/${path}`.replace('\\', '/').replace('//', '/').trim();

const updaterCreateRemoteFileURI = (fileInfo: RemoteFileInfo) =>
  `${fileInfo.path},0x${fileInfo.hash},${fileInfo.size}`;

const updateCreateLocalFileDirURI = (fileURI: string) => {
  const chunks = fileURI.split('/');
  chunks.pop();
  return chunks.join('/');
};

/**
 * Compare given [[RemoteFileInfo]] to local counterpart
 * @param fileInfo
 */
const updaterCompareRemoteFileInfo$ = (
  fileInfo: RemoteFileInfo,
  baseURI: string,
  logConfig: LogConfig = defaultLogConfig
): Observable<[RemoteFileInfo, boolean]> =>
  of(fileInfo).pipe(
    concatMap((info) =>
      updaterLocalFileData$(
        updaterCreateLocalFileURI(baseURI, fileInfo.path),
        logConfig
      ).pipe(
        map((data) => {
          const shacrypto = crypto.createHash('sha1');
          shacrypto.update(data);
          const result = shacrypto.digest('hex').toUpperCase();
          shacrypto.destroy();
          const resultBoolean =
            result === info.hash && data.byteLength === info.size;

          return resultBoolean;
        }),
        map((result) => [info, result] as [RemoteFileInfo, boolean]),
        tap(([info, result]) => {
          logEntry(
            `CompareRemoteFileInfo$::${updaterCreateRemoteFileURI(
              info
            )} / ${result}`,
            'log',
            logConfig.channels
          );
        })
      )
    ),
    catchError((err) => {
      logEntry(
        `CompareRemoteFileInfo$::${updaterCreateRemoteFileURI(
          fileInfo
        )} / ${err}`,
        'error',
        logConfig.channels
      );

      return of([fileInfo, false] as [RemoteFileInfo, boolean]);
    })
  );

const updaterCollectOutOfSyncFiles$ = (
  fileInfos: RemoteFileInfo[],
  baseURI: string,
  logConfig: LogConfig = defaultLogConfig
) =>
  from(fileInfos).pipe(
    mergeMap((info) =>
      updaterCompareRemoteFileInfo$(info, baseURI, logConfig).pipe(
        mergeMap(([info, result]) => iif(() => !!result, EMPTY, of(info)))
      )
    ),
    toArray()
  );

export {
  updaterConnectFTP$,
  updaterGetCRCInfo$,
  updaterParseRemoteFileContent,
  updaterCompareRemoteFileInfo$,
  updaterStringToRemoteFileInfo,
  updaterLocalFileData$,
  updaterCollectOutOfSyncFiles$,
  updaterGetRemoteFile$,
  updaterWriteBufferToLocalFile$,
  updaterGetAndWriteRemoteFiles$,
};
