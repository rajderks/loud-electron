import fs from 'fs';
import { DIR_LOUD_USERMAPS } from '../constants';
import { from } from 'rxjs';
import path from 'path';
import parseScenario from './parseScenario';

const checkMap$ = (mapName: string, version?: string) => {
  let mapDir = mapName;
  if (mapDir.endsWith('.scd')) {
    mapDir = mapDir.replace('.scd', '');
  }

  return from(
    new Promise<{ mapDir: string; versionExists: boolean; version?: string }>(
      (res, rej) => {
        fs.stat(path.join(DIR_LOUD_USERMAPS, mapDir), (err) => {
          if (err) {
            console.error(err);
            res({ versionExists: false, mapDir });
            return;
          }
          console.log('dir exists');

          fs.readdir(path.join(DIR_LOUD_USERMAPS, mapDir), (err, files) => {
            if (err) {
              rej(err);
              return;
            }
            const scenarioFile = files.find((f) => f.endsWith('_scenario.lua'));
            if (!scenarioFile) {
              res({ versionExists: false, mapDir });
              return;
            }
            try {
              const scenario = parseScenario(
                path.join(DIR_LOUD_USERMAPS, mapDir, scenarioFile)
              );
              res({
                versionExists: scenario.map_version === version,
                version: scenario.map_version,
                mapDir: mapDir,
              });
            } catch (e) {
              rej(e);
            }
          });
        });
      }
    )
  );
};

export default checkMap$;
