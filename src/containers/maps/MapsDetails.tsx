import React, { FunctionComponent, useState, useEffect } from 'react';
import { MapAttr } from './types';
import {
  makeStyles,
  Card,
  CardMedia,
  Typography,
  CardContent,
  colors,
  Paper,
  Button,
  CircularProgress,
} from '@material-ui/core';
import SizeIcon from '@material-ui/icons/AspectRatio';
import PlayersIcon from '@material-ui/icons/Group';
import AuthorIcon from '@material-ui/icons/Face';
import { mapSizeToString } from './utils';
import clsx from 'clsx';
import { fromFetch } from 'rxjs/fetch';
import { ajax } from 'rxjs/ajax';
import { apiBaseURI } from '../../api/api';
import { switchMap, catchError, buffer } from 'rxjs/operators';
import { of } from 'rxjs';
import checkMap$ from '../../util/checkMap';
import path from 'path';
import writeMap$ from '../../util/writeMap';
import removeMap$ from '../../util/removeMap';

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'row',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    paddingTop: 0,
    '& > div': {
      marginBottom: theme.spacing(1),
    },
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  media: {
    flexShrink: 0,
    width: 240,
    height: 240,
  },
  contentRoot: {
    display: 'flex',
    flexDirection: 'column',
    '& > div': {
      margin: theme.spacing(1, 0),
    },
  },
  flexer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  title: {
    lineHeight: 1.2,
    paddingBottom: theme.spacing(1),
  },
  sizeSelect: {
    marginLeft: 32,
  },
  infoWrapper: {
    transition: '0.1s all ease-in-out',
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
  },
  infoBox: {
    color: 'rgba(0, 0, 0, 0.87)',
    // position: 'absolute',
    backgroundColor: theme.palette.secondary.main,
    transition: '0.1s all ease-in-out',
    padding: theme.spacing(0.125, 0.5),
    display: 'flex',
    alignItems: 'center',
  },
  infoBoxIcon: {
    '&': { width: 24 },
    marginRight: theme.spacing(1),
  },
  sizeBox: {
    marginTop: theme.spacing(0.5),
  },
  boxTextColor: {
    color: 'rgba(0, 0, 0, 0.87)',
  },
}));

interface Props {
  mapAttr: MapAttr;
}

enum MapState {
  None,
  Downloading,
  Exists,
}

const MapsDetails: FunctionComponent<Props> = ({
  mapAttr: { image, author, description, file, name, players, size, version },
}) => {
  const classes = useStyles();
  const [focussed, setFocussed] = useState(false);
  const [mapState, setMapState] = useState(MapState.None);

  checkMap$(path.basename(file)).subscribe(
    () => {
      if (mapState === MapState.None) {
        setMapState(MapState.Exists);
      }
    },
    () => {
      // setMapState(MapState.None);
    }
  );

  return (
    <Card className={classes.card}>
      <div>
        <CardMedia
          image={`${apiBaseURI}/${image}`}
          className={classes.media}
          onMouseEnter={() => {
            setFocussed(true);
          }}
          onMouseLeave={() => {
            setFocussed(false);
          }}
        />
        <div
          className={classes.infoWrapper}
          style={{ opacity: focussed ? 0 : 1 }}
        >
          <Paper className={classes.infoBox}>
            <PlayersIcon
              className={clsx([classes.infoBoxIcon])}
              fontSize="small"
            />
            <Typography
              variant="caption"
              className={classes.boxTextColor}
              style={{ fontWeight: 'bold' }}
            >
              {players} Players
            </Typography>
          </Paper>
          <Paper className={clsx([classes.infoBox, classes.sizeBox])}>
            <SizeIcon
              className={clsx([classes.infoBoxIcon])}
              fontSize="small"
            />
            <Typography
              variant="caption"
              className={classes.boxTextColor}
              style={{ fontWeight: 'bold' }}
            >
              {mapSizeToString(size)}km
            </Typography>
          </Paper>
        </div>
      </div>
      <CardContent className={classes.cardContent}>
        <Typography className={classes.title} variant="h6">
          {`${name} (v${version})`}
        </Typography>

        <div className={classes.flexer}>
          <AuthorIcon
            className={classes.icon}
            color="secondary"
            style={{ transform: 'translateX(-2px)' }}
          />
          <Typography
            style={{ color: colors.grey[400] }}
            gutterBottom={false}
            variant="caption"
            color="textSecondary"
          >
            {author}
          </Typography>
        </div>

        <Typography
          component="div"
          variant="body2"
          color="textSecondary"
          style={{
            flex: 1,
            minHeight: 120,
            height: 120,
            marginBottom: 20,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {description ?? 'No description was given for this map'}
        </Typography>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => {
            if (mapState !== MapState.None && mapState !== MapState.Exists) {
              return;
            }
            if (mapState === MapState.Exists) {
              removeMap$(path.basename(file)).subscribe((n) => {
                setMapState(MapState.None);
              });
              return;
            }
            setMapState(MapState.Downloading);
            fromFetch(`${apiBaseURI}/${file}`)
              .pipe(
                switchMap(async (response) => {
                  if (response.ok) {
                    // OK return data
                    return response.arrayBuffer();
                  } else {
                    const body = await response.json();
                    throw new Error(body);
                  }
                })
              )
              .subscribe(
                (n) => {
                  writeMap$(new Buffer(n), path.basename(file)).subscribe(
                    () => {
                      setMapState(MapState.Exists);
                    },
                    () => {
                      setMapState(MapState.None);
                    }
                  );
                },
                (e) => {
                  console.error(e);
                  setMapState(MapState.None);
                }
              );
          }}
        >
          {(() => {
            switch (mapState) {
              case MapState.None:
                return 'Install map';
              case MapState.Downloading:
                return <CircularProgress size="1.5rem" />;
              case MapState.Exists:
                return 'Uninstall map';
            }
          })()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MapsDetails;
