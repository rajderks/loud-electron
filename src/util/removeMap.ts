import path from 'path';
import { DIR_LOUD_USERMAPS } from '../constants';
import { EMPTY, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { sync as rimrafsync } from 'rimraf';

const removeMap$ = (mapName: string) => {
  let mapDir = mapName;
  if (mapDir.endsWith('.scd')) {
    mapDir = mapDir.replace('.scd', '');
  }
  return of(mapDir).pipe(
    map((n) => {
      try {
        rimrafsync(path.join(DIR_LOUD_USERMAPS, n));
      } catch (e) {
        throw e;
      }
      return EMPTY;
    })
  );
};

export default removeMap$;
