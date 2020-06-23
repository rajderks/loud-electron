import { remote } from 'electron';

const BASE_URI =
  process.env.JEST_WORKER_ID === undefined
    ? remote.getGlobal('process').env.PORTABLE_EXECUTABLE_DIR ??
      process.env.REACT_APP_FS_BASE_URL ??
      './'
    : './src/util/__tests__/';

const DOC_DIR = remote.app.getPath('documents');
const DOC_DIR_SUPCOM_MAPS = `${DOC_DIR}/My Games/Gas Powered Games/Supreme Commander Forged Alliance/Maps`.replace(
  /\//g,
  '\\'
);
const DOC_DIR_SUPCOM_MODS = `${DOC_DIR}/My Games/Gas Powered Games/Supreme Commander Forged Alliance/Mods`.replace(
  /\//g,
  '\\'
);
const DOC_DIR_SUPCOM_REPLAYS = `${DOC_DIR}/My Games/Gas Powered Games/Supreme Commander Forged Alliance/replays`.replace(
  /\//g,
  '\\'
);

export {
  BASE_URI,
  DOC_DIR,
  DOC_DIR_SUPCOM_MAPS,
  DOC_DIR_SUPCOM_MODS,
  DOC_DIR_SUPCOM_REPLAYS,
};
