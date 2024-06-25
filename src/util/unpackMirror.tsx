import fs from 'fs';
import { BASE_URI } from '../constants';
import { from } from 'rxjs';
import { exec } from 'child_process';
import { logEntry } from './logger';

const uri7ZDLL = `${BASE_URI}/7z.dlll`;
const uri7Z = `${BASE_URI}/7z.exe`;
const uriLoud = `${BASE_URI}/LOUD.7z`;

const unpackMirror = () =>
  from(
    new Promise<void>((res, rej) => {
      if (
        !fs.statSync(uri7Z) ||
        !fs.statSync(uri7ZDLL) ||
        !fs.statSync(uriLoud)
      ) {
        logEntry('One of the mirrored downloads is missing', 'error', [
          'main',
          'log',
          'file',
        ]);
        rej();
        return;
      }
      exec(`"\"${uri7Z}\" x -y LOUD.7z"`, (error, stdout) => {
        if (error) {
          logEntry(error.message, 'error', ['main', 'log', 'file']);
          fs.unlinkSync(uri7Z);
          fs.unlinkSync(uri7ZDLL);
          fs.unlinkSync(uriLoud);
          rej();
        } else {
          fs.unlinkSync(uri7Z);
          fs.unlinkSync(uri7ZDLL);
          fs.unlinkSync(uriLoud);
          res();
        }
      });
    })
  );

export default unpackMirror;
