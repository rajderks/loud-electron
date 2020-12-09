import moment from 'moment';
import { map } from 'rxjs/operators';
import { PatchNote } from './types';
import { Observable } from 'rxjs';
import { AjaxObservable } from 'rxjs/internal/observable/dom/AjaxObservable';

export enum PatchNotesURL {
  Client = 'http://api.github.com/repos/RAJDerks/loud-electron/releases',
  LOUD = `https://raw.githubusercontent.com/LOUD-Project/Git-LOUD/master/CHANGELOG.txt`,
}

const fetchPatchNotes$ = (url: PatchNotesURL): Observable<PatchNote[] | null> =>
  new AjaxObservable({
    method: 'GET',
    url,
    responseType: url === PatchNotesURL.LOUD ? 'text' : 'json',
  }).pipe(
    map(({ response }: any) => {
      console.warn(response);
      if (url === PatchNotesURL.LOUD) {
        return [
          {
            body: response,
          } as PatchNote,
        ];
      }
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
