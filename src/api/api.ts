import {} from 'rxjs';
import { map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

const baseURI =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URI
    : process.env.REACT_APP_API_URI_DEV;

const constructURI = (relativeURI: string) => {
  return `${baseURI}/${relativeURI}`;
};

class API {
  get = <T>(relativeURI: string) => {
    return ajax
      .get(constructURI(relativeURI))
      .pipe(map((response) => response.response as T));
  };

  post = <T>(relativeURI: string, data: any) => {
    return ajax.post(constructURI(relativeURI), data);
  };

  put = <T>(relativeURI: string, data: Record<string, any>) => {
    return ajax
      .put(constructURI(relativeURI), data)
      .pipe(map((response) => response.response as T));
  };

  patch = <T>(relativeURI: string, data: Record<string, any>) => {
    return ajax
      .patch(constructURI(relativeURI), data)
      .pipe(map((response) => response.response as T));
  };

  delete = <T>(relativeURI: string) => {
    return ajax
      .delete(constructURI(relativeURI))
      .pipe(map((response) => response.response as T));
  };
}

export default new API();
