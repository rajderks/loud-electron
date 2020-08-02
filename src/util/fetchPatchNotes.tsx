import moment from 'moment';
import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';
import { PatchNote } from './types';
import { Observable } from 'rxjs';

export enum PatchNotesURL {
  Client = 'http://api.github.com/repos/RAJDerks/loud-electron/releases',
  LOUD = 'http://api.github.com/repos/Tanksy/GIT-LOUD/releases',
}

const fetchPatchNotes$ = (url: PatchNotesURL): Observable<PatchNote[] | null> =>
  ajax.get(url).pipe(
    map(({ response }) => {
      console.warn(response);
      if (Array.isArray(response)) {
        if (response.length === 0) {
          return null;
        }
        return response
          .map((entry) => {
            const { body, name, published_at } = entry;
            if (!body?.length) {
              return null;
            }
            return {
              body,
              name,
              published_at: moment(published_at),
            } as PatchNote;
          })
          .filter((entry) => entry) as PatchNote[];
      }
      return null;
    })
  );

export default fetchPatchNotes$;
