import React, { FunctionComponent } from 'react';
import { MapAttr } from './types';
import { Dialog } from '@material-ui/core';
import MapsDetails from './MapsDetails';

interface Props {
  mapAttr: MapAttr | null;
  onClose: () => void;
}

const MapsDetailsDialog: FunctionComponent<Props> = ({ mapAttr, onClose }) => {
  return (
    <Dialog open={!!mapAttr} onClose={onClose}>
      {mapAttr && <MapsDetails mapAttr={mapAttr} />}
    </Dialog>
  );
};

export default MapsDetailsDialog;
