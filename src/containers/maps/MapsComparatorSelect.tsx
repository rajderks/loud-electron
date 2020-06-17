import React, { FunctionComponent } from 'react';
import { SelectProps, MenuItem, Select } from '@material-ui/core';
import { MapsFilterComparator } from './types';

interface Props extends Pick<SelectProps, 'id' | 'value' | 'defaultValue'> {
  onChange: (value: MapsFilterComparator) => void;
}

const MapsComparatorSelect: FunctionComponent<Props> = ({
  id,
  value,
  defaultValue,
  onChange,
}) => {
  return (
    <Select
      id={id}
      defaultValue={defaultValue}
      value={value}
      onChange={(e) => {
        onChange(e.target.value as MapsFilterComparator);
      }}
    >
      <MenuItem value="=">=</MenuItem>
      <MenuItem value=">">{'>'}</MenuItem>
      <MenuItem value="<">{'<'}</MenuItem>
    </Select>
  );
};

export default MapsComparatorSelect;
