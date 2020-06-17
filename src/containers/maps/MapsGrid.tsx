import React, { FunctionComponent } from 'react';
import { Grid } from '@material-ui/core';

const MapsGrid: FunctionComponent = ({ children }) => {
  return (
    <Grid container alignContent="flex-start">
      {children}
    </Grid>
  );
};

export default MapsGrid;
