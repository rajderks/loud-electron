import fs from 'fs';
import {
  updaterCollectOutOfSyncFiles$,
  updaterGetCRCInfo$,
  updaterParseRemoteFileContent,
  updaterLocalFileData$,
} from '../updater';
import { map } from 'rxjs/operators';
import { RemoteFileInfo, LogConfig } from '../types';
import { BASE_URI } from '../../constants';

const defaultLogConfig: LogConfig = { channels: [] };

describe('Updater', () => {
  let infos: RemoteFileInfo[] = [];
  it('can retrieve the files CRC from the FTP', (done) => {
    updaterGetCRCInfo$(defaultLogConfig).subscribe(
      (n) => {
        fs.writeFileSync(`${BASE_URI}test-crc.txt`, n);
        done();
      },
      (e) => {
        console.error(e);
        done(e);
      }
    );
  });
  it('can parse remote file info into RemoteFileInfo instances', (done) => {
    updaterLocalFileData$('./src/util/__tests__/test-crc.txt', defaultLogConfig)
      .pipe(map((content) => updaterParseRemoteFileContent(content.toString())))
      .subscribe(
        (n) => {
          if (n.length > 0) {
            const result =
              n.every(
                (fi) =>
                  fi.hash.length > 0 &&
                  fi.path.length > 0 &&
                  typeof fi.size === 'number'
              ) && n.every((fi) => !fi.path.includes('\\'));
            if (result) {
              fs.writeFileSync(
                `${BASE_URI}test-crc-fileinfo.json`,
                JSON.stringify(n, null, 2)
              );
              infos = n;
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
    updaterCollectOutOfSyncFiles$(
      infos as RemoteFileInfo[],
      `${BASE_URI}`,
      defaultLogConfig
    ).subscribe(
      (n) => {
        expect(n.length).toBe(379);
        done();
      },
      (e) => {
        // console.error(e.errno, e);
        done(e);
      }
    );
  });
});
