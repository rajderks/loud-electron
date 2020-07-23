import path from 'path';
import fs from 'fs';
import { DOC_DIR_SUPCOM_MAPS } from '../constants';
import { from } from 'rxjs';
import { logEntry } from './logger';

const writeMap$ = (buffer: Buffer, relativePath: string, version: string) => {
  const fileName = relativePath.split('.').slice(0, -1).join('.');
  const absolutePath = path.normalize(
    `${DOC_DIR_SUPCOM_MAPS}/${fileName}.${version}${path.extname(relativePath)}`
  );
  return from(
    new Promise((res, rej) => {
      fs.writeFile(absolutePath, buffer, (err) => {
        if (err) {
          logEntry(`${err.errno}:${err.message}`, 'error', ['log']);
          rej(err);
          return;
        }
        res();
      });
    })
  );
};

export default writeMap$;
