import React, { FunctionComponent } from 'react';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(0, 4),
  },
}));

const MapsGrid: FunctionComponent = ({ children }) => {
  const classes = useStyles();
  return (
    <Grid className={classes.root} container alignContent="flex-start">
      {children}
    </Grid>
  );
};

export default MapsGrid;
