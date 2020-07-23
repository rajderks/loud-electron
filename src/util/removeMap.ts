import path from 'path';
import fs from 'fs';
import { DOC_DIR_SUPCOM_MAPS } from '../constants';
import { EMPTY, of } from 'rxjs';
import { map } from 'rxjs/operators';

const removeMap$ = (fileNames: string[]) => {
  return of(fileNames).pipe(
    map((n) => {
      for (let file of n) {
        try {
          fs.unlinkSync(
            path.normalize(`${DOC_DIR_SUPCOM_MAPS}${path.sep}${file}`)
          );
        } catch (e) {
          throw e;
        }
      }
      return EMPTY;
    })
  );
};

export default removeMap$;
