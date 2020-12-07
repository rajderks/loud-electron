import path from 'path';
import fs from 'fs';
import { DIR_LOUD_USERMAPS } from '../constants';
import { from } from 'rxjs';
import ExtractZip from 'extract-zip';
import { logEntry } from './logger';

const writeMap$ = (buffer: Buffer, fileName: string) => {
  return from(
    new Promise(async (res) => {
      const SCDPath = path.join(DIR_LOUD_USERMAPS, fileName);
      fs.writeFileSync(SCDPath, buffer);

      logEntry(`scd written: ${SCDPath}`, 'log', ['file']);
      logEntry(`unpacking: ${SCDPath}`, 'log', ['file']);
      await ExtractZip(SCDPath, { dir: DIR_LOUD_USERMAPS });
      res();
      logEntry(`removing scd: ${SCDPath}`, 'log', ['file']);
      fs.unlinkSync(SCDPath);
    })
  );
};

export default writeMap$;
