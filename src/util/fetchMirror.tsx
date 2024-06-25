import { tap } from 'rxjs/operators';
import {
  URI_EU_MIRROR_7ZIP_DLL,
  URI_EU_MIRROR_7ZIP_EXE,
  URI_EU_MIRROR_LOUD,
} from '../constants';
import { Observable, from } from 'rxjs';
import { logEntry } from './logger';

const uriDLL = new URL(URI_EU_MIRROR_7ZIP_DLL);
const uri7z = new URL(URI_EU_MIRROR_7ZIP_EXE);
const uriLOUD = new URL(URI_EU_MIRROR_LOUD);

const reqDLL = new Request(uriDLL, {
  method: 'get',
  mode: 'no-cors',
});

const req7z = new Request(uri7z, {
  method: 'get',
  mode: 'no-cors',
});

const reqLOUD = new Request(uriLOUD, {
  method: 'get',
  mode: 'no-cors',
});

const fetchMirror = () =>
  from([fetch(reqDLL), fetch(req7z), fetch(reqLOUD)]).pipe(
    tap((res) => {
      logEntry(res);
    })
  );

export default fetchMirror;
