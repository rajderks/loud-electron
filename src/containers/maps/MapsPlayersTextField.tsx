import React, { FunctionComponent } from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  Icon,
  IconButton,
  Zoom,
} from '@material-ui/core';
import PlayersIcon from '@material-ui/icons/Group';
import ClearIcon from '@material-ui/icons/Clear';

interface Props extends Pick<TextFieldProps, 'id' | 'classes' | 'disabled'> {
  onChange: (players: string) => void;
  value: string;
  label?: string;
}

const MapsPlayersTextField: FunctionComponent<Props> = ({
  id,
  classes,
  value,
  disabled,
  onChange,
  label = 'Players',
}) => {
  return (
    <TextField
      classes={classes}
      disabled={disabled}
      inputMode="numeric"
      id={id}
      InputLabelProps={{ shrink: true }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" disablePointerEvents>
            <Icon>
              <PlayersIcon />
            </Icon>
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Zoom in={!!value.length}>
              <IconButton
                size="small"
                onClick={() => {
                  onChange('');
                }}
              >
                <ClearIcon />
              </IconButton>
            </Zoom>
          </InputAdornment>
        ),
      }}
      onChange={(e) => {
        const val = e.target.value;
        if (val.length && !val.match(/^\d+$/)) {
          return;
        }
        onChange(val);
      }}
      placeholder="Amount of players..."
      label={label}
      value={value}
    />
  );
};

export default MapsPlayersTextField;
