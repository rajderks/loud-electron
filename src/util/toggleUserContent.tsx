/*
--mount_contents(SHGetFolderPath('PERSONAL') .. 'My Games\\Gas Powered Games\\Supreme Commander Forged Alliance\\mods', '/mods')
--mount_contents(SHGetFolderPath('PERSONAL') .. 'My Games\\Gas Powered Games\\Supreme Commander Forged Alliance\\maps', '/maps')
*/

import { BASE_URI, FILE_URI_LOUDDATAPATHLUA } from '../constants';
import fs from 'fs';
import { from } from 'rxjs';
import { logEntry } from './logger';
import changeLineInFile from './changeLineInFile';

type Subject = 'maps' | 'mods';

const regexString = (subject: string) =>
  `mount_contents\\(SHGetFolderPath\\('PERSONAL'\\) .. 'My Games\\\\\\\\Gas Powered Games\\\\\\\\Supreme Commander Forged Alliance\\\\\\\\${subject}', '/${subject}'\\)`;

const subjectString = (subject: string) =>
  `mount_contents(SHGetFolderPath('PERSONAL') .. 'My Games\\\\Gas Powered Games\\\\Supreme Commander Forged Alliance\\\\${subject}', '/${subject}')`;

const toggleUserContent = (subject: 'maps' | 'mods') =>
  from(
    new Promise<boolean>((res, rej) => {
      fs.stat(FILE_URI_LOUDDATAPATHLUA, (errLua) => {
        if (errLua) {
          logEntry(
            `toggleUserContent:luaFile:: LOUD/bin/LoudDataPath.lua file does not exist, unable to enable/disable user maps and mods`,
            'error'
          );
          rej();
          return;
        }
        fs.readFile(FILE_URI_LOUDDATAPATHLUA, (errRead, data) => {
          if (errRead) {
            logEntry(
              `toggleUserConrent:read:: could not read ${FILE_URI_LOUDDATAPATHLUA}`
            );
            rej();
            return;
          }
          const fileStr = data.toString();
          const regOn = new RegExp(regexString(subject));
          const regOff = new RegExp(`--${regexString(subject)}`);
          let isOn = !regOff.test(fileStr) && regOn.test(fileStr);
          const replaceStr = `${isOn ? '--' : ''}${subjectString(subject)}`;

          changeLineInFile(
            FILE_URI_LOUDDATAPATHLUA,
            isOn ? regOn : regOff,
            replaceStr
          ).subscribe(
            (n) => {
              res(!isOn);
            },
            (e) => {
              rej();
            }
          );
        });
      });
    })
  );

export const checkUserContent = (subject: Subject, suppressLog = false) =>
  from<Promise<boolean>>(
    new Promise((res, rej) => {
      const luaFilePath = `${BASE_URI}/LOUD/bin/LoudDataPath.lua`;
      fs.stat(luaFilePath, (errLua, data) => {
        if (errLua) {
          logEntry(
            `toggleUserContent:luaFile:: does not exist`,
            'error',
            suppressLog ? ['file', 'log'] : ['main', 'log', 'file']
          );
          rej();
          return;
        }
        fs.readFile(luaFilePath, (errRead, data) => {
          if (errRead) {
            logEntry(
              `toggleUserConrent:read:: could not read ${luaFilePath}`,
              'error',
              suppressLog ? ['file', 'log'] : ['main', 'log', 'file']
            );
            rej();
            return;
          }
          const fileStr = data.toString();
          const regOn = new RegExp(regexString(subject));
          const regOff = new RegExp(`--${regexString(subject)}`);
          let isOn = !regOff.test(fileStr) && regOn.test(fileStr);

          res(isOn);
        });
      });
    })
  );

export default toggleUserContent;
