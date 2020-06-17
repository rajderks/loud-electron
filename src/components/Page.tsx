import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flex: 1,
    background: theme.palette.background.default,
  },
}));

const Page: FunctionComponent<{}> = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.root}>{children}</div>;
};

export default Page;
