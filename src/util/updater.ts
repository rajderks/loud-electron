import fs from 'fs';
import ftp from 'jsftp';
import crypto from 'crypto';
import { RemoteFileInfo } from './types';
import { of, from, defer, Observable, iif, EMPTY } from 'rxjs';
import {
  switchMap,
  map,
  catchError,
  toArray,
  mergeMap,
  concatMap,
} from 'rxjs/operators';

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

const updaterGetCRCInfo$ = () =>
  from<Promise<string>>(
    new Promise((res, rej) => {
      const client: FTP = new ftp(connection) as FTP;
      client.on('connect', (errReady) => {
        if (errReady) {
          throw errReady;
        }
        client.auth(connection.user!, connection.pass!, (errAuth) => {
          if (errAuth) {
            throw errAuth;
          }
          client.get('LOUD/SCFA_FileInfo.txt', (err, socket) => {
            if (err) {
              throw err;
            }
            let str = '';
            socket.on('data', (d) => {
              str += d;
            });

            socket.on('close', (errClose) => {
              if (errClose) {
                throw errClose;
              }
              res(str);
            });
            socket.resume();
          });
        });
      });
    })
  );

const updaterGetRemoteFile$ = (fileInfo: RemoteFileInfo, client: FTP) => {
  // console.log('updaterGetRemoteFile$', fileInfo);
  return from<Promise<Buffer>>(
    new Promise((res, rej) => {
      client.get(`LOUD/${fileInfo.path}`, (err, socket) => {
        if (err) {
          console.error('updaterGetRemoteFile$', fileInfo);
          console.error(err);
          throw err;
        }
        let buffer = Buffer.from('');
        socket.on('data', (d) => {
          buffer = Buffer.concat([buffer, d]);
        });

        socket.on('close', (errClose) => {
          if (errClose) {
            throw errClose;
          }
          res(buffer);
        });
        socket.resume();
      });
    })
  );
};

const updateGetAndWriteRemoteFiles$ = (
  baseURI: string,
  fileInfos: RemoteFileInfo[]
) => {
  return new Observable((subscriber) => {
    const filesSucceeded: RemoteFileInfo[] = [];
    const filesFailed: RemoteFileInfo[] = [];
    return updaterConnectFTP$().subscribe(
      (c) => {
        from(fileInfos)
          .pipe(
            concatMap((fileInfo) =>
              updaterGetRemoteFile$(fileInfo as RemoteFileInfo, c).pipe(
                mergeMap((buffer, i) =>
                  updaterWriteBufferToLocalFile$(
                    baseURI + '/LOUD',
                    fileInfo,
                    buffer
                  ).pipe(
                    map((fi) => {
                      return [fi, true] as [RemoteFileInfo, boolean];
                    })
                  )
                ),
                catchError((e) => {
                  console.error(e);
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
              console.error(e);
            },
            () => {
              subscriber.next([filesSucceeded, filesFailed]);
              subscriber.complete();
            }
          );
      },
      (e) => {
        console.error(e);
        subscriber.error(e);
      }
    );
  });
};

const updaterWriteBufferToLocalFile$ = (
  baseURI: string,
  fileInfo: RemoteFileInfo,
  buffer: Buffer
) => {
  return from(
    new Promise<RemoteFileInfo>((res, rej) => {
      const path = updaterCreateLocalFileURI(baseURI, fileInfo.path);
      const dir = updateCreateLocalFileDirURI(path);
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          console.error(
            'updaterWriteBufferToLocalFile$',
            fileInfo,
            buffer.length
          );
          console.error(err);
          throw err;
        }
        fs.writeFile(path, buffer, (errWrite) => {
          if (errWrite) {
            throw errWrite;
          }
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

const updaterLocalFileData$ = (path: string): Observable<Buffer> =>
  defer(() =>
    from<Promise<Buffer>>(
      new Promise((res, rej) => {
        fs.readFile(path, (err, data) => {
          if (err) {
            rej(err);
          }
          res(data);
        });
      })
    )
  );

const updaterCreateLocalFileURI = (baseURI: string, path: string) =>
  `${baseURI}/${path}`.replace('\\', '/').replace('//', '/').trim();

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
  baseURI: string
): Observable<[RemoteFileInfo, boolean]> =>
  of(fileInfo).pipe(
    switchMap((info) =>
      updaterLocalFileData$(updaterCreateLocalFileURI(baseURI, info.path)).pipe(
        map((data) => {
          const shacrypto = crypto.createHash('sha1');
          shacrypto.update(data);
          const result = shacrypto.digest('hex').toUpperCase();
          shacrypto.destroy();
          return result === info.hash && data.byteLength === info.size;
        }),
        map((result) => [info, result] as [RemoteFileInfo, boolean])
      )
    ),
    catchError((err) => of([fileInfo, false] as [RemoteFileInfo, boolean]))
  );

const updateCollectOutOfSyncFiles$ = (
  fileInfos: RemoteFileInfo[],
  baseURI: string
) =>
  from(fileInfos).pipe(
    mergeMap((info) =>
      updaterCompareRemoteFileInfo$(info, baseURI).pipe(
        switchMap(([info, result]) => iif(() => !!result, EMPTY, of(info)))
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
  updateCollectOutOfSyncFiles$,
  updaterGetRemoteFile$,
  updaterWriteBufferToLocalFile$,
  updateGetAndWriteRemoteFiles$,
};
