import React, { FunctionComponent, useState } from 'react';
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
} from '@material-ui/core';
import SizeIcon from '@material-ui/icons/AspectRatio';
import PlayersIcon from '@material-ui/icons/Group';
import AuthorIcon from '@material-ui/icons/Face';
import { mapSizeToString } from './utils';
import clsx from 'clsx';
import { fromFetch } from 'rxjs/fetch';
import { ajax } from 'rxjs/ajax';
import { apiBaseURI } from '../../api/api';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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

const MapsDetails: FunctionComponent<Props> = ({
  mapAttr: { image, author, description, file, name, players, size, version },
}) => {
  const classes = useStyles();
  const [focussed, setFocussed] = useState(false);
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
            fromFetch(`${apiBaseURI}/${file}`)
              .pipe(
                switchMap((response) => {
                  if (response.ok) {
                    // OK return data
                    return response.arrayBuffer();
                  } else {
                    throw new Error('floepie');
                  }
                })
              )
              .subscribe(
                (n) => {
                  console.warn('buffa', n.byteLength);
                },
                (e) => {
                  console.error(e);
                }
              );
            // ajax
            //   .get(`${apiBaseURI}/${file}`, { responseType: 'arraybuffer' })
            //   .subscribe(
            //     (n) => {
            //       console.warn(n);
            //       console.warn('response', n.xhr.response);
            //     },
            //     (e) => {
            //       console.error(e);
            //     }
            //   );
          }}
        >
          Download
        </Button>
      </CardContent>
    </Card>
  );
};

export default MapsDetails;
