import { ajax } from 'rxjs/ajax';
import { tap } from 'rxjs/operators';

const checkUpdate$ = () =>
  ajax
    .getJSON(
      'http://api.github.com/repos/RAJDerks/loud-electron/releases/latest'
    )
    .pipe(
      tap((response) => {
        console.warn(response);
      })
    );

export default checkUpdate$;
