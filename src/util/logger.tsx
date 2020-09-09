import moment from 'moment';
import fs from 'fs';
import { LogEntry } from './types';
import { Subject, of } from 'rxjs';
import { filter, buffer, debounceTime, concatMap, tap } from 'rxjs/operators';
import { BASE_URI } from '../constants';

const LOG_URI =
  process.env.JEST_WORKER_ID === undefined
    ? process.env.NODE_ENV !== 'production'
      ? './SCFA_Updater.log'
      : `${BASE_URI}/SCFA_Updater.log`!
    : './jest_log.txt';

export const logInit = () => {
  // Legacy fix
  fs.unlink(`${BASE_URI}/loud_log.txt`, () => {});
  fs.unlink(LOG_URI, () => {});
  fs.writeFile(LOG_URI, '', () => {});
};

const logHeader = (level: LogEntry['level']) =>
  `[${level.toUpperCase()}][${moment().format('hh:mm:ssA')}]`;

const logMessage = (entry: LogEntry) => {
  const header = logHeader(entry.level);
  return `${header}: ${entry.message}`;
};

const Logger = new Subject<LogEntry>();

Logger.pipe(filter((x) => x.channels?.includes('log') ?? false)).subscribe(
  (n) => {
    const { level } = n;
    const toLog = logMessage(n);
    switch (level) {
      case 'error': {
        console.error(toLog);
        break;
      }
      case 'warn': {
        console.warn(toLog);
        break;
      }
      default:
      case 'log': {
        console.log(toLog);
        break;
      }
    }
  }
);

const logFileSubDebounce$ = Logger.pipe(debounceTime(200));
Logger.pipe(
  filter((x) => x.channels?.includes('file') ?? false),
  buffer(logFileSubDebounce$),
  concatMap((buff) =>
    of(buff).pipe(
      tap((n) => {
        try {
          const reducedMessage = n.reduce(
            (acc, le) => `${acc}${logMessage(le)}\r\n`,
            ''
          );
          fs.appendFile(LOG_URI, reducedMessage, (err) => {
            if (err) {
              console.error(err);
            }
          });
        } catch (e) {
          console.error(e);
        }
      })
    )
  )
).subscribe();

export const logEntry = (
  message: LogEntry['message'],
  level: LogEntry['level'] = 'log',
  channels: LogEntry['channels'] = ['log', 'main', 'file']
) => {
  Logger.next({ message, level, channels });
};

export default Logger;
