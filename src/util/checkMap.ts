import fs from 'fs';
import { DOC_DIR_SUPCOM_MAPS } from '../constants';
import { from } from 'rxjs';

const checkMap$ = (relativePath: string, version?: string) => {
  const fileChunks = relativePath.split('.').reverse();
  if (fileChunks.length < 2) {
    throw new Error(`Invalid map lookup, ${relativePath}, ${version}`);
  }
  fileChunks.splice(1, 0, version ?? '1');
  return from(
    new Promise<{ versionExists: boolean; versions: string[] }>((res, rej) => {
      fs.readdir(DOC_DIR_SUPCOM_MAPS, (err, files) => {
        if (err) {
          rej(err);
          return;
        }

        let versionExists = false;
        const versions = files
          .filter((f) => {
            const fChunks = f.split('.').reverse();
            if (
              fChunks[0] === 'scd' &&
              fChunks[fChunks.length - 1] === fileChunks[fileChunks.length - 1]
            ) {
              if (fChunks[1] === version) {
                versionExists = true;
              }
              return true;
            }
            return false;
          })
          .map((fileName) => fileName.split('.').join('.'));
        res({ versionExists, versions });
      });
    })
  );
};

export default checkMap$;
