import React from 'react';
import Page from '../../components/Page';
import {
  Button,
  Typography,
  Divider,
  makeStyles,
  colors,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  page: {
    flexDirection: 'column',
    color: colors.grey[100],
  },
  header: {
    WebkitAppRegion: 'drag',
    padding: theme.spacing(2, 3, 1, 3),
  },
}));

const PatchNotes = () => {
  const classes = useStyles();
  return (
    <Page className={classes.page}>
      <div className={classes.header}>
        <Typography variant="h4">Patch Notes</Typography>
      </div>
      <Divider variant="middle" />
      <Button
        variant="text"
        onClick={() => {
          require('electron').remote.getCurrentWindow().close();
        }}
      >
        CLOSE
      </Button>
    </Page>
  );
};

export default PatchNotes;
