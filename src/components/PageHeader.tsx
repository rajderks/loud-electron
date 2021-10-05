import React, { FunctionComponent } from 'react';
import TitleBar from 'frameless-titlebar';
import { Typography, makeStyles, colors } from '@material-ui/core';
const remote = require('@electron/remote');

const useStyles = makeStyles((theme) => ({
  title: {
    letterSpacing: '1.6px',
    fontWeight: 'lighter',
    marginBottom: theme.spacing(1),
    color: colors.grey[100],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 3, 1, 3),
  },
}));

interface Props {
  title: string;
}

const PageHeader: FunctionComponent<Props> = ({ children, title }) => {
  const classes = useStyles();
  const currentWindow = remote.getCurrentWindow();
  return (
    <>
      <TitleBar
        onClose={() => currentWindow.close()}
        onMinimize={() => currentWindow.minimize()}
        onMaximize={() => currentWindow.setSize(960, 544)}
        onDoubleClick={() => currentWindow.maximize()}
        title=""
        theme={{
          bar: {
            background: 'transparent',
            borderBottom: 'none',
          },
        }}
      />
      <div className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          {title}
        </Typography>
        {children}
      </div>
    </>
  );
};

export default PageHeader;
