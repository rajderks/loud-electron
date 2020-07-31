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
import { apiBaseURI } from '../../api/api';
import { switchMap } from 'rxjs/operators';
import checkMap$ from '../../util/checkMap';
import path from 'path';
import writeMap$ from '../../util/writeMap';
import removeMap$ from '../../util/removeMap';
import { logEntry } from '../../util/logger';

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
  Outdated,
}

const MapsDetails: FunctionComponent<Props> = ({
  mapAttr: { image, author, description, file, name, players, size, version },
}) => {
  const classes = useStyles();
  const [focussed, setFocussed] = useState(false);
  const [mapState, setMapState] = useState(MapState.None);

  useEffect(() => {
    checkMap$(path.basename(file), version).subscribe(
      ({ versionExists, versions }) => {
        if (versionExists) {
          setMapState(MapState.Exists);
        } else if (versions.length > 0) {
          setMapState(MapState.Outdated);
        }
      },
      () => {
        // setMapState(MapState.None);
      }
    );
  }, [file, version]);

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
          {`${name} (${version})`}
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
            if (mapState === MapState.Downloading) {
              return;
            }
            if (mapState === MapState.Exists) {
              checkMap$(path.basename(file), version)
                .pipe(switchMap(({ versions }) => removeMap$(versions)))
                .subscribe(
                  () => {
                    setMapState(MapState.None);
                  },
                  (e) => {
                    logEntry(e, 'error', ['log']);
                  }
                );
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
                }),
                switchMap((buffer) =>
                  checkMap$(path.basename(file), version).pipe(
                    switchMap(({ versions }) =>
                      removeMap$(versions).pipe(
                        switchMap(() =>
                          writeMap$(
                            new Buffer(buffer),
                            path.basename(file),
                            version
                          )
                        )
                      )
                    )
                  )
                )
              )
              .subscribe(
                () => {
                  setMapState(MapState.Exists);
                },
                (e) => {
                  logEntry(e, 'error', ['log']);
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
              case MapState.Outdated:
                return 'Out of date';
            }
          })()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MapsDetails;
