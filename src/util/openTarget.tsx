import fs from 'fs';
import { spawn } from 'child_process';
import {
  DOC_DIR_SUPCOM_MAPS,
  DOC_DIR_SUPCOM_MODS,
  DOC_DIR_SUPCOM_REPLAYS,
  FILE_URI_LOG,
  FILE_URI_INFO,
  FILE_URI_GAMELOG,
  FILE_URI_HELP,
  FILE_URI_LOUDDATAPATHLUA,
} from '../constants';
import { from } from 'rxjs';

export type Target =
  | 'datapathlua'
  | 'maps'
  | 'mods'
  | 'replays'
  | 'log'
  | 'gamelog'
  | 'help'
  | 'info';

const targetPath = (target: Target) => {
  switch (target) {
    case 'maps':
      return `C:/Windows/explorer.exe`;

    case 'mods':
      return `C:/Windows/explorer.exe`;

    case 'replays':
      return `C:/Windows/explorer.exe`;

    case 'log':
      return `notepad.exe`;

    case 'gamelog':
      return `notepad.exe`;

    case 'help':
      return `notepad.exe`;

    case 'info':
      return `notepad.exe`;
    default:
      throw new Error('invalid target');
  }
};

export const targetURI = (target: Target) => {
  switch (target) {
    case 'datapathlua':
      return FILE_URI_LOUDDATAPATHLUA;
    case 'maps':
      return DOC_DIR_SUPCOM_MAPS;
    case 'mods':
      return DOC_DIR_SUPCOM_MODS;
    case 'replays':
      return DOC_DIR_SUPCOM_REPLAYS;
    case 'log':
      return FILE_URI_LOG;
    case 'gamelog':
      return FILE_URI_GAMELOG;
    case 'help':
      return FILE_URI_HELP;
    case 'info':
      return FILE_URI_INFO;
    default:
      throw new Error('invalid target');
  }
};

export const openTargetCheck = (target: Target) =>
  from(
    new Promise<boolean>((res) => {
      fs.stat(targetURI(target), (err) => {
        if (err) {
          res(false);
          return;
        }
        res(true);
      });
    })
  );

const openTarget = (target: Target) => {
  let path = targetPath(target);
  let targetArgs: string[] = [targetURI(target)];
  if (!targetPath.length) {
    return;
  }
  spawn(path, targetArgs);
};

export default openTarget;
