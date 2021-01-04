import fs from 'fs';
import path from 'path';
import { Observable } from 'rxjs';
import { DIR_LOUD_GAMEDATA } from '../constants';

const generatedLuaDir = path.join(DIR_LOUD_GAMEDATA, 'lua', 'generated');
const generatedLuaFile = path.join(generatedLuaDir, 'MapBlacklist.lua');

const template = (
  syncJSON: Record<string, string>
) => `-- THIS IS A GENERATED FILE
MapBlacklist = { ${syncMapToLua(syncJSON)} }`;

const syncMapToLua = (syncJSON: Record<string, string>) => {
  let res: string[] = [];
  Object.keys(syncJSON).forEach((key) => {
    res.push(`['${key}'] = true`);
  });
  return res.join(', ');
};

const mapSyncWrite$ = (syncJSON: Record<string, string>) =>
  new Observable((sub) => {
    // Create dir
    try {
      fs.mkdir(generatedLuaDir, { recursive: true }, (err) => {
        // Check if dir was created or already exists
        if (err) {
          fs.stat(generatedLuaDir, (err, stat) => {
            if (!stat.isDirectory) {
              sub.error(err);
              return;
            }
          });
        }
        fs.stat(generatedLuaFile, (err, stat) => {
          if (!stat?.isFile) {
            fs.writeFileSync(generatedLuaFile, template(syncJSON));
            sub.next();
            sub.complete();
          } else {
            fs.unlinkSync(generatedLuaFile);
            fs.writeFileSync(generatedLuaFile, template(syncJSON));
            sub.next();
            sub.complete();
          }
        });
      });
    } catch (err) {
      sub.error(err);
    }
  });

export default mapSyncWrite$;
