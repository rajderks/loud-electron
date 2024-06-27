import fs from 'fs';
import { BASE_URI } from '../constants';
import { from } from 'rxjs';
import { exec } from 'child_process';
import { logEntry } from './logger';

const uri7ZDLL = `${BASE_URI}/7z.dll`;
const uri7Z = `${BASE_URI}/7z.exe`;
const uriLoud = `${BASE_URI}/LOUD.7z`;
const uriTarget = `${BASE_URI}/`;

const unpackMirror = (onComplete?: () => void) =>
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
      exec(
        `"${uri7Z.replace(/\//g, '\\')}" x -y "${uriLoud.replace(
          /\//g,
          '\\'
        )}" -o"${uriTarget.replace(/\//g, '\\')}"`,
        (error, stdout) => {
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
            if (onComplete) {
              onComplete();
            }
            res();
          }
        }
      );
    })
  );

export default unpackMirror;
