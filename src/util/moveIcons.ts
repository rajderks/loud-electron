import fs from 'fs';
import { DIR_LOUD_BIN, DIR_LOUD_USERMODS } from '../constants';
import { logEntry } from './logger';
import rimraf from 'rimraf';

export enum IconSet {
  Classic = 0,
  Small,
  SmallClassic,
  Medium,
  MediumClassic,
  Large,
  LargeClassic,
}

const stableIconPrefix = 'BrewLAN-StrategicIconsOverhaul-';
const stableIconSuffix = '.scd';

const stableIconDict = {
  [IconSet.Classic]: 'NONE_EXISTANT',
  [IconSet.Small]: stableIconPrefix + 'SMALL' + stableIconSuffix,
  [IconSet.SmallClassic]: stableIconPrefix + 'SMALL-classic' + stableIconSuffix,
  [IconSet.Medium]: stableIconPrefix + 'MEDIUM' + stableIconSuffix,
  [IconSet.MediumClassic]:
    stableIconPrefix + 'MEDIUM-classic' + stableIconSuffix,
  [IconSet.Large]: stableIconPrefix + 'LARGE' + stableIconSuffix,
  [IconSet.LargeClassic]: stableIconPrefix + 'LARGE-classic' + stableIconSuffix,
};

const moveIcons = (iconSet: IconSet) => {
  const targetIconSet = stableIconDict[iconSet];
  const targetIconSetPath = `${DIR_LOUD_BIN}/${targetIconSet}`;
  const targetIconDestPath = `${DIR_LOUD_USERMODS}/${targetIconSet}`;
  removeExistingIconSet(() => {
    if (iconSet === IconSet.Classic) {
      logEntry('Installed classic icons', 'log', ['main', 'file', 'log']);
      return;
    }
    fs.stat(`${DIR_LOUD_BIN}/${targetIconSet}`, (fsErr) => {
      if (fsErr) {
        logEntry(
          `Could not find ${targetIconSet} in Bin folder ${targetIconSetPath}.`,
          'error',
          ['main', 'log', 'file']
        );
        return;
      }
      logEntry(`Found ${targetIconSetPath}`, 'log', ['main', 'log', 'file']);
      fs.copyFile(targetIconSetPath, targetIconDestPath, (writeErr) => {
        if (writeErr) {
          logEntry(
            `Could not write ${targetIconDestPath} :  ${writeErr.message}.`,
            'error',
            ['main', 'log', 'file']
          );
          return;
        }
        logEntry(`Succesfully installed ${targetIconSet}`, 'log', [
          'main',
          'log',
          'file',
        ]);
      });
    });
  });
};

const removeExistingIconSet = (callback: () => void) => {
  let existingIconSet: string | null = null;

  logEntry(`Removing existing IconSet if any exist`, 'log', [
    'main',
    'log',
    'file',
  ]);

  fs.readdir(DIR_LOUD_USERMODS, (readDirErr, files) => {
    if (readDirErr) {
      logEntry(
        `Error finding existing IconSet: ${readDirErr.message}`,
        'error',
        ['main', 'log', 'file']
      );
      return;
    }
    existingIconSet =
      files.find((val) => val.startsWith(stableIconPrefix)) ?? null;
    if (existingIconSet) {
      rimraf(`${DIR_LOUD_USERMODS}/${existingIconSet}`, (err) => {
        if (err) {
          logEntry(`Error removing exisiting IconSet ${err.message}`, 'error', [
            'main',
            'log',
            'file',
          ]);
          return;
        }
        logEntry(`Removed existing IconSet ${existingIconSet}`, 'log', [
          'main',
          'log',
          'file',
        ]);
        callback();
      });
    } else {
      callback();
    }
  });
};

export default moveIcons;
