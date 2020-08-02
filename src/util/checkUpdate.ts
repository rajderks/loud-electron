import { ajax } from 'rxjs/ajax';
import { tap } from 'rxjs/operators';
import { logEntry } from './logger';

const checkUpdate$ = () =>
  ajax
    .getJSON(
      'http://api.github.com/repos/RAJDerks/loud-electron/releases/latest'
    )
    .pipe(
      tap((response) => {
        // logEntry(response);
        console.warn(response);
      })
    );

export default checkUpdate$;
