import React, { FunctionComponent, useState, useRef, useEffect } from 'react';
import { MapsFilter, MapsFilterComparator } from './types';
import {
  TextField,
  makeStyles,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Icon,
  // FormControlLabel,
  // Checkbox,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import SizeIcon from '@material-ui/icons/AspectRatio';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import MapsSizeSelect from './MapsSizeSelect';
import MapsPlayersTextField from './MapsPlayersTextField';
import MapsComparatorSelect from './MapsComparatorSelect';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(3, 4, 3, 4),
  },
  content: {
    display: 'flex',
    flex: '0 0 auto',
    flexWrap: 'wrap',
    alignItems: 'center',
    margin: '0 auto',
    maxWidth: 1440,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  filterWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    '& > div:first-child': {
      margin: theme.spacing(1, 0),
    },
    '& > div:nth-child(2)': {
      marginLeft: 0,
      minWidth: 40,
      textAlign: 'center',
    },
  },
  sizeIcon: {
    position: 'absolute',
    bottom: 13,
  },
  sizeSelect: {
    marginLeft: 32,
  },
  topFilterBar: {
    display: 'flex',
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap',
    },
  },
  addButton: {
    display: 'flex',
    flex: '0 0 100px',
    margin: theme.spacing(0, 1.5, 0, 0),
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(1, 0),
    },
  },
  officialFormLabel: {
    alignSelf: 'flex-end',
    marginLeft: theme.spacing(2),
  },
}));

interface Props {
  onAddClicked: (open: boolean) => void;
  onChangeFilters: (filters: MapsFilter[]) => void;
}

const MapsFilters: FunctionComponent<Props> = ({
  // onAddClicked,
  onChangeFilters,
}) => {
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const [size, setSize] = useState(-1);
  const [official] = useState(false);
  const [sizeComparator, setSizeComparator] = useState<MapsFilterComparator>(
    '='
  );
  const [players, setPlayers] = useState('');
  const [playersComparator, setPlayersComparator] = useState<
    MapsFilterComparator
  >('=');
  const subjectRef = useRef<
    Subject<{
      search: typeof search;
      size: typeof size;
      sizeComparator: typeof sizeComparator;
      playersComparator: typeof playersComparator;
      players: typeof players;
      official: typeof official;
    }>
  >(new Subject());

  useEffect(() => {
    const subscription = subjectRef
      .current!.pipe(debounceTime(225))
      .subscribe(
        ({ search, size, sizeComparator, playersComparator, players }) => {
          const filters: MapsFilter[] = [];
          if (search) {
            filters.push({
              key: 'search',
              value: search.toLowerCase(),
              comparator: '<>',
            });
          }
          if (size !== -1) {
            filters.push({
              key: 'size',
              value: size,
              comparator: sizeComparator,
            });
          }
          if (players.length) {
            filters.push({
              key: 'players',
              value: Number.parseInt(players),
              comparator: playersComparator,
            });
          }
          if (official) {
            filters.push({
              key: 'official',
              value: 1,
              comparator: '=',
            });
          }
          onChangeFilters(filters);
        }
      );
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  });

  useEffect(() => {
    subjectRef.current.next({
      search,
      size,
      players,
      sizeComparator,
      playersComparator,
      official,
    });
  }, [players, playersComparator, search, size, sizeComparator, official]);

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.topFilterBar}>
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" disablePointerEvents>
                  <Icon>
                    <SearchIcon />
                  </Icon>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {!!search.length ? (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearch('');
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  ) : (
                    <></>
                  )}
                </InputAdornment>
              ),
            }}
            style={{
              flex: '1 1 90%',
              marginRight: '10%',
            }}
            placeholder="Search for a map by name or author"
            label="Search"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            value={search}
          />
          {/* <Button
            variant="contained"
            color="secondary"
            classes={{ root: classes.addButton }}
            onClick={() => onAddClicked(true)}
          >
            ADD MAP
          </Button> */}
        </div>
        <div className={classes.filterWrapper}>
          <FormControl className={classes.formControl}>
            <InputLabel
              shrink
              id="size-select"
              color={size >= 0 ? 'secondary' : 'primary'}
            >
              Size
            </InputLabel>
            <MapsSizeSelect
              id="size-select"
              classes={{ select: classes.sizeSelect }}
              onChange={setSize}
              value={size}
              defaultValue={-1}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel shrink id="size-select-comp"></InputLabel>
            <MapsComparatorSelect
              id="size-select-comp"
              onChange={setSizeComparator}
              defaultValue="="
              value={sizeComparator}
            />
          </FormControl>

          <SizeIcon className={classes.sizeIcon} color="primary" />
        </div>
        <div className={classes.filterWrapper}>
          <FormControl className={classes.formControl}>
            <InputLabel shrink id="players-textfield">
              Players
            </InputLabel>
            <MapsPlayersTextField
              id="players-textfield"
              value={players}
              onChange={setPlayers}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel shrink id="players-select"></InputLabel>
            <MapsComparatorSelect
              id="players-select"
              onChange={setPlayersComparator}
              defaultValue="="
              value={playersComparator}
            />
          </FormControl>
          {/* <FormControlLabel
            className={classes.officialFormLabel}
            label="Official only"
            control={
              <Checkbox
                checked={official}
                onChange={(e) => {
                  setOfficial(e.target.checked);
                }}
              />
            }
          /> */}
        </div>
      </div>
    </div>
  );
};

export default MapsFilters;
