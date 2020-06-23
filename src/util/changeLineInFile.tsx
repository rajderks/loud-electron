import fs from 'fs';
import { from } from 'rxjs';
import { logEntry } from './logger';

const changeLineInFile = (
  path: string,
  find: string | RegExp,
  replace: string
) => 
  from(
    new Promise((res, rej) => {
      fs.readFile(path, 'utf8', (errRead, data) => {
        if (errRead) {
          logEntry(`changeLineInFile:write:: ${errRead}`, 'error');
          rej();
          return;
        }

        var result = data.replace(find, replace);

        fs.writeFile(path, result, 'utf8', function (errWrite) {
          if (errWrite) {
            logEntry(`changeLineInFile:write:: ${errWrite}`, 'error');
            rej();
            return;
          }
          res();
        });
      });
    })
  );

export default changeLineInFile;
