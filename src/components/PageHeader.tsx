import React, { FunctionComponent } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  makeStyles,
  Button,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {},
}));

const PageHeader: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          LOUD PROJECT
        </Typography>
        <Button color="inherit">News</Button>
        <Button color="inherit">Maps</Button>
        <Button color="inherit">Downloads</Button>
      </Toolbar>
    </AppBar>
  );
};

export default PageHeader;
