import React, {
  FunctionComponent,
  useEffect,
  useState,
  useCallback,
} from 'react';
import api from '../../api/api';
import MapsTile from './MapsTile';
import MapsGrid from './MapsGrid';
import MapsFilters from './MapsFilters';
import {
  makeStyles,
  Typography,
  darken,
  Box,
  Chip,
  Divider,
  Fab,
} from '@material-ui/core';
import { MapsFilter, MapAttr } from './types';
import PageHeader from '../../components/PageHeader';
import MapsDetailsDialog from './MapsDetailsDialog';
import { logEntry } from '../../util/logger';
import toggleUserContent, {
  checkUserContent,
} from '../../util/toggleUserContent';
import { RefreshRounded } from '@material-ui/icons';
import mapSync$ from '../../util/mapSync';
import { DIR_LOUD_USERMAPS } from '../../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    alignContent: 'flex-start',
    backgroundColor: darken('#282C31', 0.35),
    overflow: 'hidden',
  },
  gridWrapper: {
    display: 'flex',
    flex: '1 1 auto',
    overflowY: 'auto',
    maxWidth: 1440,
    margin: '0 auto',
    marginBottom: theme.spacing(1),
  },
  headerDivider: {
    margin: theme.spacing(0, 2, 0.5, 2),
    height: 47 - theme.spacing(0.5),
  },
  mapsChip: {
    marginBottom: theme.spacing(0.5),
  },
}));

const Maps: FunctionComponent<{}> = () => {
  const classes = useStyles();
  const [maps, setMaps] = useState<MapAttr[] | null>(null);
  const [mapsOutOfSync, setMapsOutOfSync] = useState<Record<
    string,
    string
  > | null>(null);
  const [mapsFiltered, setMapsFiltered] = useState<MapAttr[] | null>(maps);
  const [mapsFailed, setMapsFailed] = useState(true);
  const [mapsDetailsAttr, setMapsDetailsAttr] = useState<MapAttr | null>(null);
  const [refreshTimestamp, setRefreshTimestamp] = useState(0);
  const [outOfSyncTimestamp, setOutOfSyncTimestamp] = useState(0);
  const [userMapsEnabled, setUserMapsEnabled] = useState(false);

  useEffect(() => {
    checkUserContent('maps').subscribe((n) => {
      setUserMapsEnabled(n);
    });
  }, []);

  useEffect(() => {
    api.get<MapAttr[]>('maps').subscribe(
      (n) => {
        setMapsFailed(false);
        setMaps(n);
        setMapsFiltered(n);
      },
      (e) => {
        console.error(e);
        setMapsFailed(true);
      }
    );
  }, [refreshTimestamp]);

  useEffect(() => {
    mapSync$(DIR_LOUD_USERMAPS).subscribe(
      (syncMap) => {
        setMapsOutOfSync(syncMap?.response ?? null);
      },
      () => {
        setMapsOutOfSync(null);
      }
    );
  }, [refreshTimestamp, outOfSyncTimestamp]);

  const handleFiltersChanged = useCallback(
    (filters: MapsFilter[]) => {
      if (!maps) {
        return;
      }
      if (!filters.length) {
        setMapsFiltered(maps.slice());
        return;
      }
      setMapsFiltered(
        maps.slice().filter((map) =>
          filters.every((filter) => {
            if (filter.key === 'official') {
              return true;
            }
            if (filter.key === 'search') {
              return (
                map.name.toLowerCase().includes(String(filter.value)) ||
                map.author.toLowerCase().includes(String(filter.value))
              );
            }

            if (filter.key === 'outdated') {
              return mapsOutOfSync?.[map.identifier] !== undefined;
            }
            const mapVal = map[filter.key as keyof MapAttr];

            if (typeof mapVal !== typeof filter.value) {
              return false;
            }
            if (filter.comparator === '=') {
              return mapVal === filter.value;
            } else if (filter.comparator === '>') {
              return mapVal > filter.value;
            } else if (filter.comparator === '<') {
              return mapVal < filter.value;
            }
            return false;
          })
        )
      );
    },
    [maps, mapsOutOfSync]
  );

  const handleOnClickMap = useCallback((mapAttr: MapAttr) => {
    setMapsDetailsAttr(mapAttr);
  }, []);

  const handleMapsDetailsOnClose = useCallback(() => {
    setMapsDetailsAttr(null);
    setOutOfSyncTimestamp(new Date().valueOf());
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshTimestamp(Date.now().valueOf());
  }, []);

  return (
    <>
      <PageHeader title="Maps">
        <Divider
          orientation="vertical"
          className={classes.headerDivider}
          variant="middle"
        />
        <Chip
          label={
            userMapsEnabled ? 'External maps enabled' : 'External maps disabled'
          }
          size="small"
          className={classes.mapsChip}
          color={userMapsEnabled ? 'secondary' : 'default'}
          onClick={() => {
            toggleUserContent('maps').subscribe((n) => {
              logEntry(`Toggled External content | maps : ${n}`);
              setUserMapsEnabled(n);
            });
          }}
        />
      </PageHeader>
      <div className={classes.root}>
        <MapsDetailsDialog
          mapAttr={mapsDetailsAttr}
          onClose={handleMapsDetailsOnClose}
        />
        <MapsFilters
          onChangeFilters={handleFiltersChanged}
          onRefresh={handleRefresh}
        />
        <div className={classes.gridWrapper}>
          {!mapsFailed ? (
            <MapsGrid>
              {mapsFiltered
                ?.map((x, i) => ({ ...x, id: i }))
                .map((mapAttr) => (
                  <MapsTile
                    {...mapAttr}
                    outdated={mapsOutOfSync?.[mapAttr.identifier] !== undefined}
                    key={mapAttr.id}
                    onClick={() => {
                      handleOnClickMap(mapAttr);
                    }}
                  />
                ))}
            </MapsGrid>
          ) : (
            <Box
              display="flex"
              flex="1 1 100%"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Typography color="textPrimary" style={{ paddingBottom: 24 }}>
                Something went wrong.
              </Typography>
              <Fab
                size="small"
                color="secondary"
                onClick={() => {
                  setRefreshTimestamp(Date.now().valueOf());
                }}
              >
                <RefreshRounded />
              </Fab>
            </Box>
          )}
        </div>
      </div>
    </>
  );
};

export default Maps;
