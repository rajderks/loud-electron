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
  buffer,
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

const updaterParseRemoteFileContent = (
  remoteFileContent: string
): RemoteFileInfo[] =>
  remoteFileContent
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
      updaterLocalFileData$(`${baseURI}/${info.path}`).pipe(
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
        switchMap(([info, result]) =>
          iif(
            () => {
              if (result) {
                console.warn('res', result);
              }
              return !!result;
            },
            EMPTY,
            of(info)
          )
        )
      )
    ),
    toArray()
  );

export {
  updaterGetCRCInfo$,
  updaterParseRemoteFileContent,
  updaterCompareRemoteFileInfo$,
  updaterStringToRemoteFileInfo,
  updaterLocalFileData$,
  updateCollectOutOfSyncFiles$,
};
