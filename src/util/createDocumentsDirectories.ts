import fs from 'fs';
import { from, iif, Observable, of } from 'rxjs';
import { concatMap, switchMap, map } from 'rxjs/operators';
import { openTargetCheck, Target, targetURI } from './openTarget';
import { logEntry } from './logger';

const createDocumentsDirectories$ = () =>
  from(['maps', 'mods', 'replays'] as Target[]).pipe(
    concatMap<Target, Observable<[Target, boolean]>>((dir) =>
      openTargetCheck(dir).pipe(
        switchMap((exists) =>
          iif<boolean, boolean>(
            () => !!exists,
            of(true),
            from(
              new Promise<boolean>((res) => {
                fs.mkdir(targetURI(dir), { recursive: true }, (err) => {
                  if (err) {
                    res(false);
                    logEntry(`createDocumentsDirectories$:${dir}::`, 'error');
                    return;
                  }
                  res(true);
                });
              })
            )
          )
        ),
        map((result) => [dir, result])
      )
    )
  );

export default createDocumentsDirectories$;
