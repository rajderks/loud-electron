import fs from 'fs';
import { BASE_URI } from '../constants';
import { from } from 'rxjs';

const checkFolder = () =>
  from(
    new Promise((res, rej) => {
      fs.stat(`${BASE_URI}/bin/SupremeCommander.exe`, (errSC) => {
        if (errSC) {
          fs.stat(`${BASE_URI}/bin/ForgedAlliance.exe`, (errFA) => {
            if (errFA) {
              rej();
            }
            res();
          });
          return;
        }
        res();
      });
    })
  );

export default checkFolder;
