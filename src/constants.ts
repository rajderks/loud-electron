import { remote } from 'electron';
import path from 'path';

const isJest = process.env.JEST_WORKER_ID !== undefined;

const BASE_URI: string = !isJest
  ? remote.getGlobal('process').env.PORTABLE_EXECUTABLE_DIR ??
    process.env.REACT_APP_FS_BASE_URL ??
    './'
  : './src/util/__tests__/';

const DOC_DIR = isJest ? '' : remote.app.getPath('documents');
const APPDATA_DIR = isJest ? '' : remote.app.getPath('appData');
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

const DOC_URI_GAMEPREFS = path.resolve(
  `${APPDATA_DIR}/../Local/Gas Powered Games/Supreme Commander Forged Alliance/Game.prefs`.replace(
    /\//g,
    '\\'
  )
);

const DIR_LOUD_GAMEDATA = `${BASE_URI}/LOUD/gamedata`;
const DIR_LOUD_USERMAPS = `${BASE_URI}/LOUD/usermaps`;
const DIR_LOUD_USERMODS = `${BASE_URI}/LOUD/usermods`;
const FILE_URI_LOG = `${BASE_URI}/SCFA_Updater.log`;
const FILE_URI_GAMELOG = `${BASE_URI}/LOUD/bin/loud.log`;
const FILE_URI_HELP = `${BASE_URI}/LOUD/doc/help.txt`;
const FILE_URI_INFO = `${BASE_URI}/LOUD/doc/info.txt`;
const FILE_URI_LOUDDATAPATHLUA = `${BASE_URI}/LOUD/bin/LoudDataPath.lua`;
const FILE_URI_ICONMOD = `${BASE_URI}/LOUD/bin/Advanced Strategic Icons Mod Installer.exe`.replace(
  /\//g,
  '\\'
);
const FILE_URI_ICON = `${BASE_URI}/LOUD/bin/loud.ico`;
const FILE_URI_SHORTCUT = `${BASE_URI}/LOUD/bin/shortcut.vbs`;

export {
  BASE_URI,
  DIR_LOUD_GAMEDATA,
  DOC_DIR,
  DOC_URI_GAMEPREFS,
  DOC_DIR_SUPCOM_MAPS,
  DOC_DIR_SUPCOM_MODS,
  DOC_DIR_SUPCOM_REPLAYS,
  FILE_URI_LOG,
  FILE_URI_GAMELOG,
  FILE_URI_HELP,
  FILE_URI_INFO,
  FILE_URI_LOUDDATAPATHLUA,
  FILE_URI_ICONMOD,
  FILE_URI_ICON,
  FILE_URI_SHORTCUT,
  DIR_LOUD_USERMAPS,
  DIR_LOUD_USERMODS,
};
