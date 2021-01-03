import { from, Observable } from 'rxjs';
import fs from 'fs';
import { map, mergeMap, switchMap, toArray } from 'rxjs/operators';
import checkMap$ from './checkMap';
import api from '../api/api';

const mapSyncDir$ = (mapsPath: string) =>
  new Observable<Map<string, string>>((sub) => {
    fs.stat(mapsPath, (err, stat) => {
      if (err) {
        sub.error(err);
        return;
      }
      if (!stat.isDirectory) {
        sub.error(new Error(`${mapsPath} is not a directory.`));
        return;
      }
      fs.readdir(mapsPath, (err, dirs) => {
        if (err) {
          sub.error(err);
          return;
        }
        if (dirs.length === 0) {
          sub.next(new Map());
          sub.complete();
          return;
        }
        from(dirs)
          .pipe(
            mergeMap((dir) => mapSyncSingle$(dir)),
            toArray<[string, string]>(),
            map(
              (tuples: [string, string][]) => new Map(tuples.filter((t) => !!t))
            )
          )
          .subscribe((syncMap: Map<string, string>) => {
            sub.next(syncMap);
            sub.complete();
          });
      });
    });
  });

const mapSyncSingle$ = (mapDir: string): Observable<[string, string]> =>
  checkMap$(mapDir).pipe(map(({ version }) => [mapDir, version ?? '0']));

const mapSync$ = (dirPath: string) =>
  mapSyncDir$(dirPath).pipe(
    map((syncMap) => {
      const mapSyncArr: { identifier: string; version: string }[] = [];
      for (let [key, value] of syncMap) {
        mapSyncArr.push({ identifier: key, version: value });
      }
      console.warn('mapSyncArr', mapSyncArr);
      return mapSyncArr;
    }),
    switchMap((syncObj) => api.post('maps/sync', syncObj))
  );

export default mapSync$;
