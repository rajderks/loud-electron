import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';

import { compare } from 'semver';
import { version } from '../../package.json';

const checkClientUpdate$ = () =>
  ajax
    .get(`http://api.github.com/repos/RAJDerks/loud-electron/releases/latest`)
    .pipe(
      map(
        ({
          response: { tag_name, assets },
        }: {
          response: {
            tag_name: string;
            assets: { name: string; browser_download_url: string }[];
          };
        }) => {
          const result = compare(version, tag_name);
          if (result < 0) {
            const exeUrl = assets.find((asset) => asset.name.endsWith('.exe'));
            return exeUrl?.browser_download_url ?? null;
          }
          return null;
        }
      )
    );

export default checkClientUpdate$;
