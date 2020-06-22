import { Subject } from 'rxjs';

const MainLogDownloadFilePercentageStatusSubject = new Subject<number>();
const MainLogDownloadFileProgressStatusSubject = new Subject<
  [number, number]
>();

export {
  MainLogDownloadFilePercentageStatusSubject,
  MainLogDownloadFileProgressStatusSubject,
};
