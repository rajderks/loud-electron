import React, { FunctionComponent, useState } from 'react';
import {
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  TextField,
  FormControlLabel,
  Checkbox,
  makeStyles,
  FormControl,
  InputLabel,
  Typography,
} from '@material-ui/core';
import MapsPlayersTextField from './MapsPlayersTextField';
import MapsSizeSelect from './MapsSizeSelect';
import SizeIcon from '@material-ui/icons/AspectRatio';
import api from '../../api/api';
import { retry } from 'rxjs/operators';

const useStyles = makeStyles((theme) => ({
  contentRoot: {
    display: 'flex',
    flexDirection: 'column',
    '& > div': {
      margin: theme.spacing(1, 0),
    },
  },
  sizeIcon: {
    position: 'absolute',
    bottom: 6,
  },
  sizeSelect: {
    marginLeft: 32,
  },
}));

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MapsAddDialog: FunctionComponent<Props> = ({ open, setOpen }) => {
  const classes = useStyles();
  const [name, setName] = useState('');
  const [players, setPlayers] = useState('');
  const [size, setSize] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    if (!file || !image || !name.length || uploading || !players.length) {
      return;
    }

    setUploading(true);

    formData.append('file', file);
    formData.append('image', image);
    formData.append('name', name);
    formData.append('players', players);
    formData.append('size', String(size));

    api
      .post('maps', formData)
      .pipe(retry(0))
      .subscribe(
        (n) => {
          console.warn(n);
        },
        (e) => {
          setUploading(false);
          console.error(e);
        },
        () => {
          setUploading(false);
        }
      );
  };
  return (
    <>
      <Dialog open={open} maxWidth="lg">
        <form action="" onSubmit={handleSubmit}>
          <DialogContent classes={{ root: classes.contentRoot }}>
            <TextField
              disabled={uploading}
              label="Map name*"
              InputLabelProps={{ shrink: true }}
              placeholder="Enter the map name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <MapsPlayersTextField
              id="add-players-textfield"
              label="Players*"
              disabled={uploading}
              onChange={setPlayers}
              value={players}
            />
            <FormControl>
              <InputLabel shrink id="add-size-select">
                Size*
              </InputLabel>
              <MapsSizeSelect
                id="add-size-select"
                disabled={uploading}
                classes={{ select: classes.sizeSelect }}
                onChange={setSize}
                value={size}
                defaultValue={size}
              />
              <SizeIcon className={classes.sizeIcon} />
            </FormControl>
            <FormControlLabel
              label="Official map"
              control={<Checkbox disabled={uploading} value={false} />}
            />
            <div>
              <Button
                variant="contained"
                component="label"
                color="primary"
                disabled={uploading}
              >
                Select File (.zip or .rar)
                <input
                  name="file"
                  type="file"
                  accept=".zip, .rar"
                  style={{ display: 'none' }}
                  disabled={uploading}
                  onChange={(e) => {
                    if (!e.target.files?.[0]) {
                      setFile(null);
                      setFileName(null);
                      return;
                    }
                    setFile(e.target.files[0]!);
                    const val = e.target.value;
                    setFileName(
                      val.split('\\').join('/').split('/').pop() ?? null
                    );
                  }}
                />
              </Button>
              {fileName ? (
                <Typography variant="body2">{fileName}</Typography>
              ) : null}
            </div>
            <div>
              <Button
                variant="contained"
                component="label"
                color="primary"
                disabled={uploading}
              >
                Select Image
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (!e.target.files?.[0]) {
                      setImage(null);
                      setImageName(null);
                      return;
                    }
                    setImage(e.target.files[0]!);
                    const val = e.target.value;
                    setImageName(
                      val.split('\\').join('/').split('/').pop() ?? null
                    );
                  }}
                />
              </Button>
              {imageName ? (
                <Typography variant="body2">{imageName}</Typography>
              ) : null}
            </div>
            <Typography variant="caption">*required</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit" disabled={uploading}>
              ADD
            </Button>
            <Button
              disabled={uploading}
              onClick={() => {
                setOpen(false);
              }}
            >
              CANCEL
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default MapsAddDialog;
