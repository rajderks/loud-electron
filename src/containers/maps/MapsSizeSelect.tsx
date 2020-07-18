import React, { FunctionComponent } from 'react';
import { Select, MenuItem, SelectProps } from '@material-ui/core';

interface Props
  extends Pick<
    SelectProps,
    'id' | 'classes' | 'defaultValue' | 'disabled' | 'value'
  > {
  onChange: (size: number) => void;
  disableAll?: true;
}

const MapsSizeSelect: FunctionComponent<Props> = ({
  id,
  classes,
  defaultValue,
  disableAll,
  disabled,
  onChange,
  value,
}) => {
  return (
    <Select
      classes={classes}
      disabled={disabled}
      id={id}
      defaultValue={defaultValue}
      value={value}
      onChange={(e) => {
        onChange(e.target.value as number);
      }}
    >
      {!disableAll ? <MenuItem value={-1}>All</MenuItem> : null}
      <MenuItem value={0}>5x5</MenuItem>
      <MenuItem value={1}>10x10</MenuItem>
      <MenuItem value={2}>20x20</MenuItem>
      <MenuItem value={3}>40x40</MenuItem>
      <MenuItem value={4}>80x80</MenuItem>
    </Select>
  );
};

export default MapsSizeSelect;
