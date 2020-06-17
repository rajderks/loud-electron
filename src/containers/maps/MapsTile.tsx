import React, { FunctionComponent } from 'react';
import { MapAttr } from '../../types';
import {
  Grid,
  useTheme,
  Card,
  CardMedia,
  makeStyles,
  CardContent,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import PlayersIcon from '@material-ui/icons/Group';
import SizeIcon from '@material-ui/icons/AspectRatio';
import ViewsIcon from '@material-ui/icons/Visibility';
import DownloadsIcon from '@material-ui/icons/GetApp';
import { mapSizeToString } from './utils';

const useStyles = makeStyles((theme) => ({
  floep: {
    padding: theme.spacing(1),
    transition: '0.1s all ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
      zIndex: 10,
    },
    minWidth: 180,
    maxWidth: 240,
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    cursor: 'pointer',
  },
  media: {
    flexShrink: 0,
    width: '100%',
    paddingTop: '100%',
  },
  titleBox: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    background: 'rgba(0,0,0,0.6)',
    right: 0,
    width: '100%',
    padding: theme.spacing(1),
  },
  content: {
    '&&': {
      padding: theme.spacing(1),
    },
    display: 'flex',
    flex: '1 1 auto',
    height: theme.spacing(2) + 48,
    flexWrap: 'wrap',
  },
  contentItem: {
    '&:nth-child(odd)': {
      justifyContent: 'flex-start',
    },
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: '1 1 50%',
  },
  contentIcon: {
    marginRight: theme.spacing(1),
  },
}));

interface Props extends MapAttr {}

const MapsTile: FunctionComponent<Props> = ({
  image,
  name,
  size,
  downloads,
  version,
  views,
  players,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const downLg = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Grid item xs={6} sm={3} md={3} lg={2} xl={2} className={classes.floep}>
      <Card square elevation={1} className={classes.root}>
        <CardMedia image={image} className={classes.media} />
        <div className={classes.titleBox}>
          <Typography
            variant={downLg ? 'body1' : 'body1'}
            style={{ fontWeight: 'bold', color: 'white' }}
          >
            {`${name} (${version})`}
          </Typography>
        </div>
        <CardContent classes={{ root: classes.content }}>
          <div className={classes.contentItem}>
            <ViewsIcon className={classes.contentIcon} /> {views}
          </div>
          <div className={classes.contentItem}>
            <SizeIcon className={classes.contentIcon} /> {mapSizeToString(size)}
          </div>
          <div className={classes.contentItem}>
            <DownloadsIcon className={classes.contentIcon} /> {downloads}
          </div>
          <div className={classes.contentItem}>
            <PlayersIcon className={classes.contentIcon} /> {players}
          </div>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default MapsTile;
