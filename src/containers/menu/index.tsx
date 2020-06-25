import { remote } from 'electron';
import React, { FunctionComponent, useCallback, useContext } from 'react';
import TitleBar from 'frameless-titlebar';
import { MenuItem } from 'frameless-titlebar/dist/title-bar/typings';
import toggleUserContent from '../../util/toggleUserContent';
import { logEntry } from '../../util/logger';
import MainContext from '../main/MainContext';
import openTarget from '../../util/openTarget';
import { updaterCreateLocalCRC$ } from '../../util/updater';

const currentWindow = remote.getCurrentWindow();

const Menu: FunctionComponent = () => {
  const { changeEnabledItem, enabledItems } = useContext(MainContext);

  const clicky = useCallback<(menu: MenuItem) => void>(
    (menu) => {
      if (menu.id === 'toggle-maps' || menu.id === 'toggle-mods') {
        const target = menu.id.split('-')[1] as 'maps' | 'mods';
        toggleUserContent(target).subscribe((n) => {
          logEntry('Toggled user content');
          changeEnabledItem(target, n);
        });
      } else if (
        menu.id === 'open-maps' ||
        menu.id === 'open-mods' ||
        menu.id === 'open-replays'
      ) {
        const target = menu.id.split('-')[1] as 'maps' | 'mods' | 'replays';
        openTarget(target);
      } else if (
        menu.id === 'help-help' ||
        menu.id === 'help-info' ||
        menu.id === 'help-gamelog'
      ) {
        const target = menu.id.split('-')[1] as 'maps' | 'mods' | 'replays';
        openTarget(target);
      } else if (menu.id === 'create-crc') {
        updaterCreateLocalCRC$().subscribe();
      }
    },
    [changeEnabledItem]
  );

  return (
    <>
      <TitleBar
        iconSrc={require('../../assets/loud.ico')}
        currentWindow={currentWindow}
        platform={process.platform as any}
        menu={[
          {
            label: 'Game',
            click: clicky,
          },
          {
            label: 'Tools',
            submenu: [
              {
                id: 'open-maps',
                label: 'Open Maps folder',
                click: clicky,
                disabled: !enabledItems.includes('open-maps'),
              },
              {
                id: 'open-mods',
                label: 'Open Mods folder',
                click: clicky,
                disabled: !enabledItems.includes('open-mods'),
              },
              {
                id: 'open-replays',
                label: 'Open Replays folder',
                click: clicky,
                disabled: !enabledItems.includes('open-replays'),
              },
              {
                id: 'toggle-maps',
                label: 'Toggle user maps',
                click: clicky,
                disabled: !enabledItems.includes('louddatapathlua'),
              },
              {
                id: 'toggle-mods',
                label: 'Toggle user mods',
                click: clicky,
                disabled: !enabledItems.includes('louddatapathlua'),
              },
              {
                id: 'create-crc',
                label: 'Create CRC file',
                click: clicky,
                disabled: !enabledItems.includes('run'),
              },
            ],
          },
          {
            label: 'Help',
            click: clicky,
            submenu: [
              {
                id: 'help-help',
                label: 'Menu help',
                click: clicky,
                disabled: !enabledItems.includes('help-help'),
              },
              {
                id: 'help-info',
                label: 'Game Info',
                click: clicky,
                disabled: !enabledItems.includes('help-info'),
              },
              {
                id: 'help-gamelog',
                label: 'View Game Log',
                click: clicky,
                disabled: !enabledItems.includes('help-gamelog'),
              },
            ],
          },
        ]}
        title="LOUD Supreme Commander Forged Alliance Updater & Game Launcher -- Version 5.00"
        onClose={() => currentWindow.close()}
        onMinimize={() => currentWindow.minimize()}
        onMaximize={() => currentWindow.setSize(960, 544)}
        onDoubleClick={() => currentWindow.maximize()}
      ></TitleBar>
    </>
  );
};

export default Menu;
