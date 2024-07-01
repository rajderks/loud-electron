import fs from 'fs';
import { BASE_URI } from '../constants';
import { from } from 'rxjs';
import { logEntry } from './logger';
//@ts-ignore
import Seven from 'node-7z';

const uriLoud = `${BASE_URI}/LOUD.7z`;
const uri7Z = `${BASE_URI}/7z.exe`;
const uri7ZDLL = `${BASE_URI}/7z.dll`;

const unpackMirror = (
  onProgress: (perc: number) => void,
  onComplete?: () => void
) =>
  from(
    new Promise<void>((res, rej) => {
      if (!fs.statSync(uriLoud)) {
        logEntry('One of the mirrored downloads is missing', 'error', [
          'main',
          'log',
          'file',
        ]);
        rej();
        return;
      }
      const seven = Seven.extractFull(
        `${uriLoud.replace(/\//g, '\\')}`,
        `${BASE_URI}`,
        {
          $bin: uri7Z.replace(/\//g, '\\'),
          $progress: true,
        }
      );
      seven.on('progress', (perc: { percent: number }) => {
        if (onProgress) {
          onProgress(perc.percent);
        }
      });
      seven.on('end', () => {
        try {
          fs.unlinkSync(uri7Z);
          fs.unlinkSync(uri7ZDLL);
          fs.unlinkSync(uriLoud);
        } catch (e) {
          console.warn(e);
        }
        if (onComplete) {
          onComplete();
        }
        res();
      });
      seven.on('error', function (err: any) {
        // a standard error
        // `err.stderr` is a string that can contain extra info about the error
        logEntry(err.stderr, 'error', ['file', 'log', 'main']);
        if (fs.statSync(uriLoud)) {
          // fs.unlinkSync(uriLoud);
        }
        rej();
      });
    })
  );

export default unpackMirror;
