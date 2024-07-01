import fs from 'fs';
import { BASE_URI } from '../constants';
import { from } from 'rxjs';

const checkCleanInstall = () =>
  from(
    new Promise<void>((res, rej) => {
      fs.stat(`${BASE_URI}/loud/bin/LoudDataPath.lua`, (errFA) => {
        if (errFA) {
          rej();
        }
        res();
      });
      return;
    })
  );

export default checkCleanInstall;
