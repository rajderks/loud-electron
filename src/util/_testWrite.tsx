import fs from 'fs';
import { BASE_URI } from '../constants';
import { from } from 'rxjs';

const testWrite = () => {
  return from(
    new Promise((res, rej) => {
      fs.writeFile(
        `${BASE_URI}/.test.txt`,
        'You can safely remove this file',
        (errWrite) => {
          if (errWrite) {
            rej(errWrite);
            return;
          }
          fs.unlink(`${BASE_URI}/.test.txt`, (errUnlink) => {
            if (errUnlink) {
              rej(errUnlink);
            }
            res();
          });
        }
      );
    })
  );
};

export default testWrite;
