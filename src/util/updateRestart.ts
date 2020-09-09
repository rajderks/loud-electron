import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { BASE_URI } from '../constants';
import { logEntry } from './logger';
import { from } from 'rxjs';

const BAT_NAME = 'SCFA_Updater.bat';

const template = () => `
REM @ECHO OFF
${BASE_URI[0]}: 
cd "${BASE_URI}"

TASKKILL /F /IM "SCFA_Updater.exe"

RENAME ".\\SCFA_Updater.exe" "SCFA_Updater_BACKUP"
RENAME ".\\SCFA_Updater_UPDATE" "SCFA_Updater.exe"

START "" ".\\SCFA_Updater.exe"

DEL /F ".\\SCFA_Updater_BACKUP"
EXIT
`;

const writeUpdater = () =>
  from(
    new Promise<any>((res) => {
      try {
        fs.unlinkSync(path.join(BASE_URI, BAT_NAME));
      } catch (e) {
        logEntry(`${e}`, 'error', ['log']);
      }
      fs.writeFileSync(path.join(BASE_URI, BAT_NAME), template());
      res();
    })
  );

const executeUpdate = () => {
  exec(`start cmd.exe /c "${path.join(BASE_URI, BAT_NAME)}"`, (e) => {
    if (e) {
      logEntry(`${e}`, 'error', ['file', 'log', 'main']);
    }
  });
};

const updateRestart = (buffer: Buffer) => {
  if (buffer?.byteLength) {
    fs.writeFile(path.join(BASE_URI, 'SCFA_Updater_UPDATE'), buffer, (err) => {
      if (err) {
        logEntry(`Writing auto-update failed: ${err}`, 'error', [
          'file',
          'log',
        ]);
        logEntry(
          'Could not write auto-update file. Please post the loud_log.txt in Discords #bug-report channel.'
        );
        throw new Error();
      }
      writeUpdater().subscribe(
        () => {
          executeUpdate();
        },
        (e) => {
          logEntry(`${e}`, 'error', ['log']);
        }
      );
    });
  } else {
    logEntry(`Writing auto-update failed: ${buffer}`, 'error', [
      'file',
      'log',
      'main',
    ]);
    logEntry(
      'Could not auto-update. Please post the loud_log.txt in Discords #bug-report channel.'
    );
    throw new Error();
  }
};

export const updateRestartCleanup = () => {
  try {
    fs.stat(path.join(BASE_URI, BAT_NAME), (err, stats) => {
      if (err) {
        return;
      }
      fs.unlinkSync(path.join(BASE_URI, BAT_NAME));
    });
  } catch (e) {
    logEntry(e, 'error', ['file']);
  }
};

export default updateRestart;
