import { map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { AjaxRequest } from 'rxjs/internal/observable/dom/AjaxObservable';

// export const apiBaseURI = 'https://theloudproject.org:8081';
export const apiBaseURI = process.env.REACT_APP_API_URI_DEV;

const constructURI = (relativeURI: string) => {
  return `${apiBaseURI}/${relativeURI}`;
};

class API {
  get = <T>(relativeURI: string, opts?: AjaxRequest) => {
    return ajax({
      url: constructURI(relativeURI),
      responseType: 'json',
      method: 'get',
      ...opts,
    }).pipe(map((response) => response.response as T));
  };

  post = <T>(relativeURI: string, data: any) => {
    return ajax.post(constructURI(relativeURI), data, {
      'Content-Type': 'application/json',
    });
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
