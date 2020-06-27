import fs from 'fs';
import { execFile, spawn, exec } from 'child_process';
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
  const BASE_URI_WIN = BASE_URI.replace(/\//g, '\\');
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

        exec(
          `"${BASE_URI}/bin/SupremeCommander.exe" /log "${BASE_URI_WIN}\\LOUD\\bin\\Loud.log" /init "${BASE_URI_WIN}\\LOUD\\bin\\LoudDataPath.lua"`
        );
      });
      return;
    }
    exec(
      `"${BASE_URI}/bin/ForgedAlliance.exe" /log "${BASE_URI_WIN}\\LOUD\\bin\\Loud.log" /init "${BASE_URI_WIN}\\LOUD\\bin\\LoudDataPath.lua"`
    );
  });
};

export default rungame;
