import React, {
  FunctionComponent,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import { makeStyles, Fab, Zoom, darken } from '@material-ui/core';
import Logger from '../../util/logger';
import { filter, scan, debounceTime, buffer, map } from 'rxjs/operators';
import PinDownIcon from '@material-ui/icons/GetApp';

const useStyles = makeStyles((theme) => ({
  root: {
    height: 180,
    maxHeight: 180,
    minHeight: 180,
    padding: theme.spacing(1),
    width: '100%',
    backgroundColor: darken('#282C31', 0.35),
    borderTop: `${theme.palette.background.paper} solid 8px`,
    borderBottom: `${theme.palette.background.paper} solid 24px`,
  },
  scroller: {
    height: '100%',
    width: '100%',
    color: 'white',
    overflowY: 'auto',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize * 0.9,
    whiteSpace: 'pre-line',
    fontWeight: theme.typography.fontWeightLight,
    WebkitScrollbar: {
      display: 'none',
    },
    overscrollBehaviorY: 'contain',
    '& > span': {
      float: 'left',
      clear: 'both',
    },
    '& > span:last-child': {
      scrollSnapAlign: 'end',
    },
  },
  fabWrapper: {
    position: 'absolute',
    right: theme.spacing(3),
    bottom: theme.spacing(4),
  },
}));

const logSub = Logger.pipe(filter((x) => x.channels.includes('main')));
const logSubDebounce = Logger.pipe(
  filter((x) => x.channels.includes('main')),
  debounceTime(25)
);

const MainLog: FunctionComponent = () => {
  const classes = useStyles();
  const logRef = useRef<HTMLDivElement | null>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [messages, setMessages] = useState<string[]>([
    'Welcome to the LOUD Client!',
    'Press the Update button to update LOUD to the latest version, or run the game with the Run Game button',
  ]);

  useEffect(() => {
    const sub = logSub
      .pipe(
        buffer(logSubDebounce),
        map((buff) => buff.map((fi) => fi.message.split('::').pop()!.trim())),
        scan((acc, val) => [...acc, ...val], [] as string[])
      )
      .subscribe((n) => {
        setMessages(n);
      });
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

  const wheelListener = useCallback((e) => {
    const logReffer = logRef.current;
    if (!logReffer) {
      return;
    }
    const height = logReffer.getBoundingClientRect().height;
    const scrollTop = logReffer.scrollTop;
    const scrollHeight = logReffer.scrollHeight;

    if ((e as WheelEvent).deltaY < 0) {
      setUserScrolled(true);
    } else if (scrollHeight - scrollTop - height < 80) {
      setUserScrolled(false);
    }
  }, []);

  useLayoutEffect(() => {
    const logReffer = logRef.current;
    if (!logReffer) {
      return;
    }
    logReffer.addEventListener('mousewheel', wheelListener, { passive: true });
    return () => {
      logReffer.removeEventListener('mousewheel', wheelListener);
    };
  }, [wheelListener]);

  return (
    <div className={classes.root}>
      <div
        className={classes.scroller}
        ref={logRef}
        style={!userScrolled ? { scrollSnapType: 'y mandatory' } : {}}
      >
        <>
          {messages.map((m, i) => (
            <span key={`${m.substr(0, 3)}-${i}`}>{m}</span>
          ))}
        </>
      </div>
      <div className={classes.fabWrapper}>
        <Zoom in={userScrolled}>
          <Fab
            size="small"
            onClick={() => {
              setUserScrolled(false);
            }}
          >
            <PinDownIcon />
          </Fab>
        </Zoom>
      </div>
    </div>
  );
};

export default React.memo(MainLog, () => false);
