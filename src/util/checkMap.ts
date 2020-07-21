import path from 'path';
import fs from 'fs';
import { DOC_DIR_SUPCOM_MAPS } from '../constants';
import { from } from 'rxjs';
import { logEntry } from './logger';

const checkMap$ = (relativePath: string) => {
  const absolutePath = path.normalize(`${DOC_DIR_SUPCOM_MAPS}/${relativePath}`);
  return from(
    new Promise((res, rej) => {
      fs.stat(absolutePath, (err) => {
        if (err) {
          if (err.code !== 'ENOENT') {
            logEntry(`${err.errno}:${err.message}`, 'error', ['log']);
          }
          rej(err);
          return;
        }
        res();
      });
    })
  );
};

export default checkMap$;
