import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flex: 1,
    background: theme.palette.background.default,
    position: 'relative',
  },
}));

interface Props {
  className?: string;
}

const Page: FunctionComponent<Props> = ({ children, className }) => {
  const classes = useStyles();
  return <div className={clsx(classes.root, className)}>{children}</div>;
};

export default Page;
