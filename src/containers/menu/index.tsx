import React, { FunctionComponent } from 'react';
import { makeStyles, Typography, Divider, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  menu: {
    display: 'flex',
    flex: '0 0 100%',
    height: 24,
    maxHeight: 24,
    backgroundColor: '#001220',
    // @ts-ignore
    WebkitAppRegion: 'drag',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemWrapper: {
    display: 'flex',
    flex: '0 0 auto',
    alignItems: 'center',
  },
  menuItem: {
    '&:first-child': {
      paddingLeft: theme.spacing(1),
    },
    padding: theme.spacing(0, 2),
    color: 'white',
    margin: 0,
  },
}));

const Menu: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.menu}>
        <div className={classes.menuItemWrapper}>
          <Typography variant="caption" className={classes.menuItem}>
            GAME
          </Typography>
          <Typography variant="caption" className={classes.menuItem}>
            TOOLS
          </Typography>
          <Typography variant="caption" className={classes.menuItem}>
            HELP
          </Typography>
        </div>
        <div>
          <IconButton size="small" style={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <Divider variant="fullWidth" />
    </>
  );
};

export default Menu;
