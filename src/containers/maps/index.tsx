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
import { makeStyles, Typography } from '@material-ui/core';
import { MapsFilter, MapAttr } from './types';
import MapsAddDialog from './MapsAddDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flex: '1 1 auto',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    padding: theme.spacing(0, 4, 4, 4),
    maxWidth: 1440,
    margin: '0 auto',
  },
}));

const Maps: FunctionComponent<{}> = () => {
  const classes = useStyles();
  const [maps, setMaps] = useState<MapAttr[] | null>(null);
  const [mapsFiltered, setMapsFiltered] = useState<MapAttr[] | null>(maps);
  const [mapsFailed, setMapsFailed] = useState(false);
  const [addOpen, setAddOpen] = useState(true);

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
  }, []);

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
    [maps]
  );

  const handleAddOpen = useCallback((open) => {
    setAddOpen(open);
  }, []);

  return (
    <div className={classes.root}>
      <MapsAddDialog open={addOpen} setOpen={handleAddOpen} />
      <MapsFilters
        onChangeFilters={handleFiltersChanged}
        onAddClicked={handleAddOpen}
      />
      <MapsGrid>
        {!mapsFailed ? (
          mapsFiltered
            ?.map((x, i) => ({ ...x, id: i }))
            .map((mapAttr) => <MapsTile {...mapAttr} key={mapAttr.id} />)
        ) : (
          <Typography>
            Something went wrong. Refresh the page to try again
          </Typography>
        )}
      </MapsGrid>
    </div>
  );
};

export default Maps;
