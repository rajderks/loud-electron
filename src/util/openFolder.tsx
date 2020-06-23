import { spawn } from 'child_process';
import {
  DOC_DIR_SUPCOM_MAPS,
  DOC_DIR_SUPCOM_MODS,
  DOC_DIR_SUPCOM_REPLAYS,
} from '../constants';

const openFolder = (target: 'maps' | 'mods' | 'replays') => {
  let targetPath = '';
  let targetArgs: string[] = [];
  switch (target) {
    case 'maps':
      targetPath = `C:/Windows/explorer.exe`;
      targetArgs = [DOC_DIR_SUPCOM_MAPS];
      break;

    case 'mods':
      targetPath = `C:/Windows/explorer.exe`;
      targetArgs = [DOC_DIR_SUPCOM_MODS];
      break;
    case 'replays':
      targetPath = `C:/Windows/explorer.exe`;
      targetArgs = [DOC_DIR_SUPCOM_REPLAYS];
      break;
    default:
      return;
  }
  if (!targetPath.length) {
    return;
  }
  spawn(targetPath, targetArgs);
};

export default openFolder;
