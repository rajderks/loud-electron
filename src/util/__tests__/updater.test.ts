import fs from 'fs';
import {
  updateCollectOutOfSyncFiles$,
  updaterGetCRCInfo$,
  updaterParseRemoteFileContent,
  updaterLocalFileData$,
} from '../updater';
import { map } from 'rxjs/operators';
import testCrcFileinfos from './test-crc-fileinfo.json';
import { RemoteFileInfo } from '../types';
import { fstat } from 'fs';

const BASE_URI = './src/util/__tests__/';

describe('Updater', () => {
  it('can retrieve the files CRC from the FTP', (done) => {
    updaterGetCRCInfo$().subscribe(
      (n) => {
        done();
      },
      (e) => {
        console.error(e);
        done(e);
      }
    );
  });
  it('can parse remote file info into RemoteFileInfo instances', (done) => {
    updaterLocalFileData$('./src/util/__tests__/test-crc.txt')
      .pipe(map((content) => updaterParseRemoteFileContent(content.toString())))
      .subscribe(
        (n) => {
          if (n.length > 0) {
            const result = n.every(
              (fi) =>
                fi.hash.length > 0 &&
                fi.path.length > 0 &&
                typeof fi.size === 'number'
            );
            if (result) {
              done();
            } else {
              done(
                new Error(
                  `Found invalid file infos ${JSON.stringify(n, null, 2)}`
                )
              );
            }
          } else {
            done(
              new Error(`Couldn't parse test-crc into RemoteFileInfo: ${n}`)
            );
          }
        },
        (e) => {
          done(e);
        }
      );
  });
  it('can identify which local items are out of sync', (done) => {
    updateCollectOutOfSyncFiles$(
      testCrcFileinfos as RemoteFileInfo[],
      `${BASE_URI}/LOUD`
    ).subscribe(
      (n) => {
        console.warn('LEN', n.length);
        expect(n.length).toBe(379);
        done();
      },
      (e) => {
        console.error(e.errno, e);
        done(e);
      }
    );
  });
});
