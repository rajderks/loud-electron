import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';

import { compare } from 'semver';
import { version } from '../../package.json';

const checkClientUpdate$ = () =>
  ajax
    .get(`http://api.github.com/repos/RAJDerks/loud-electron/releases/latest`)
    .pipe(
      map(({ response: { tag_name, html_url } }) => {
        const result = compare(version, tag_name);
        if (result < 0) {
          return html_url;
        }
        return null;
      })
    );

export default checkClientUpdate$;
