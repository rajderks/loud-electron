import { remote } from 'electron';

const isJest = process.env.JEST_WORKER_ID !== undefined;

const BASE_URI = !isJest
  ? remote.getGlobal('process').env.PORTABLE_EXECUTABLE_DIR ??
    process.env.REACT_APP_FS_BASE_URL ??
    './'
  : './src/util/__tests__/';

const DOC_DIR = isJest ? '' : remote.app.getPath('documents');
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
const DIR_LOUD_GAMEDATA = `${BASE_URI}/LOUD/gamedata`;
const FILE_URI_LOG = `${BASE_URI}/loud_log.txt`;
const FILE_URI_GAMELOG = `${BASE_URI}/LOUD/bin/loud.log`;
const FILE_URI_HELP = `${BASE_URI}/LOUD/doc/help.txt`;
const FILE_URI_INFO = `${BASE_URI}/LOUD/doc/info.txt`;
const FILE_URI_LOUDDATAPATHLUA = `${BASE_URI}/LOUD/bin/LoudDataPath.lua`;

export {
  BASE_URI,
  DIR_LOUD_GAMEDATA,
  DOC_DIR,
  DOC_DIR_SUPCOM_MAPS,
  DOC_DIR_SUPCOM_MODS,
  DOC_DIR_SUPCOM_REPLAYS,
  FILE_URI_LOG,
  FILE_URI_GAMELOG,
  FILE_URI_HELP,
  FILE_URI_INFO,
  FILE_URI_LOUDDATAPATHLUA,
};
