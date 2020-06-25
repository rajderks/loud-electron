import fs from 'fs';
import path from 'path';
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
import { BASE_URI } from '../constants';

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
    concatMap((info) =>
      updaterCompareRemoteFileInfo$(info, baseURI, logConfig).pipe(
        mergeMap(([info, result]) => iif(() => !!result, EMPTY, of(info)))
      )
    ),
    toArray()
  );

const excludeCRC = [
  'louddatapath.lua',
  'usermaps',
  'usermods',
  'usergamedata',
  'loud.log',
];

const updaterCreateLocalCRC$ = () => {
  logEntry('updaterCreateLocalCRC$:: Starting the CRC Process');
  return from(
    new Promise((res, rej) => {
      const walk = (
        dir: string,
        done: (err: Error | null, results?: string[]) => void
      ) => {
        var results: string[] = [];
        fs.readdir(dir, (err, list) => {
          if (err) {
            return done(err);
          }
          var pending = list.length;
          if (!pending) {
            return done(null, results);
          }
          list.forEach((file) => {
            file = path.resolve(dir, file);
            fs.stat(file, (_err, stat) => {
              if (stat && stat.isDirectory()) {
                walk(file, (_err, res) => {
                  results = results.concat(res!);
                  if (!--pending) done(null, results);
                });
              } else {
                results.push(file);
                if (!--pending) done(null, results);
              }
            });
          });
        });
      };
      walk(`${BASE_URI}/LOUD`, (err, results) => {
        if (err || !results) {
          logEntry(`updaterCreateLocalCRC$:walk::${err} / ${results}`);
          rej(err);
          return;
        }
        const crcs = results
          .filter((res) => {
            return !excludeCRC.find((ex) => res.toLowerCase().includes(ex));
          })
          .map((result) => {
            const buffer = fs.readFileSync(result);
            const fileURI = path
              .normalize(result)
              .replace(path.normalize(`${BASE_URI}/LOUD/`), '');
            const shacrypto = crypto.createHash('sha1');
            shacrypto.update(buffer);
            const sha1 = shacrypto.digest('hex').toUpperCase();
            shacrypto.destroy();
            return `${fileURI},0x${sha1},${buffer.byteLength}`;
          });
        crcs.push(
          'bin\\LoudDataPath.lua,0xE0A4D83007A0222CD1EDBD77E6CFA81BB2F32252,1499'
        );
        crcs.sort();
        fs.writeFile(
          `${BASE_URI}/SCFA_FileInfo.txt`,
          crcs.join('\r\n'),
          (err) => {
            if (err) {
              logEntry(`Could not generate CRC file ${err}`, 'error');
              rej(err);
              return;
            }
            logEntry(
              'updaterCreateLocalCRC$:: Finished the CRC Process. The file is located at ./SCFA_FileInfo.txt'
            );
            res();
          }
        );
      });
    })
  );
};

export {
  updaterCreateLocalCRC$,
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
