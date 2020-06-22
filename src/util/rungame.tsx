import fs from 'fs';
import { execFile } from 'child_process';
import { BASE_URI } from '../constants';
import { logEntry } from './logger';

const callback = (error: Error | null, stdout: string, stderr: string) => {
  if (error) {
    console.error(error);
  }
  if (stdout) {
    console.error(stdout);
  }
  if (stderr) {
    console.error(stderr);
  }
};

const rungame = () => {
  // "D:\SteamLibrary\steamapps\common\Supreme Commander Forged Alliance\bin\SupremeCommander.exe"  /log "..\LOUD\bin\Loud.log" /init "..\LOUD\bin\LoudDataPath.lua"
  fs.stat(`${BASE_URI}/bin/ForgedAlliance.exe`, (errFA) => {
    if (errFA) {
      // try SupCom
      fs.stat(`${BASE_URI}/bin/SupremeCommander.exe`, (errSC) => {
        if (errSC) {
          logEntry(
            `Could not find FA/SC .exe ${BASE_URI}/bin/SupremeCommander.exe`,
            'error'
          );
          // try SupCom
        }
        execFile(
          `${BASE_URI}/bin/SupremeCommander.exe`,
          [
            '/log',
            '.../LOUD/bin/Loud.log',
            '/init',
            '../LOUD/bin/LoudDataPath.lua',
          ],
          callback
        );
      });
    }
    execFile(
      `${BASE_URI}/bin/ForgedAlliance.exe`,
      [
        '/log',
        '.../LOUD/bin/Loud.log',
        '/init',
        '../LOUD/bin/LoudDataPath.lua',
      ],
      callback
    );
  });
};

export default rungame;
