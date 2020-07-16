import { remote, ipcRenderer } from 'electron';
import React, { FunctionComponent, useCallback, useContext } from 'react';
import TitleBar from 'frameless-titlebar';
import { MenuItem } from 'frameless-titlebar/dist/title-bar/typings';
import toggleUserContent from '../../util/toggleUserContent';
import { logEntry } from '../../util/logger';
import MainContext from '../main/MainContext';
import openTarget from '../../util/openTarget';
import { updaterCreateLocalCRC$ } from '../../util/updater';
import rungame from '../../util/rungame';
import { version } from '../../../package.json';

const currentWindow = remote.getCurrentWindow();

const Menu: FunctionComponent = () => {
  const { changeEnabledItem, enabledItems } = useContext(MainContext);

  const buttonCallback = useCallback<(menu: MenuItem) => void>(
    (menu) => {
      if (menu.id === 'game-run') {
        rungame();
      } else if (menu.id === 'toggle-maps' || menu.id === 'toggle-mods') {
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
        menu.id === 'help-discord' ||
        menu.id === 'help-help' ||
        menu.id === 'help-info' ||
        menu.id === 'help-gamelog'
      ) {
        const target = menu.id.split('-')[1] as 'maps' | 'mods' | 'replays';
        openTarget(target);
      } else if (menu.id === 'create-crc') {
        updaterCreateLocalCRC$().subscribe();
      } else if (menu.id === 'run-iconmod') {
        openTarget('iconmod');
      } else if (menu.id === 'help-patchnotes') {
        ipcRenderer.send('open-route', 'patchnotes');
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
            click: buttonCallback,
            submenu: [
              {
                id: 'game-run',
                label: 'Run game',
                click: buttonCallback,
                disabled: !enabledItems.includes('run'),
              },
            ],
          },
          {
            label: 'Tools',
            submenu: [
              {
                id: 'run-iconmod',
                label: 'Icons Mod Installer',
                click: buttonCallback,
                disabled: !enabledItems.includes('iconmod'),
              },
              {
                id: 'open-maps',
                label: 'Open Maps folder',
                click: buttonCallback,
                disabled: !enabledItems.includes('open-maps'),
              },
              {
                id: 'open-mods',
                label: 'Open Mods folder',
                click: buttonCallback,
                disabled: !enabledItems.includes('open-mods'),
              },
              {
                id: 'open-replays',
                label: 'Open Replays folder',
                click: buttonCallback,
                disabled: !enabledItems.includes('open-replays'),
              },
              {
                id: 'toggle-maps',
                label: 'Toggle user maps',
                click: buttonCallback,
                disabled: !enabledItems.includes('louddatapathlua'),
              },
              {
                id: 'toggle-mods',
                label: 'Toggle user mods',
                click: buttonCallback,
                disabled: !enabledItems.includes('louddatapathlua'),
              },
              {
                id: 'create-crc',
                label: 'Create CRC file',
                click: buttonCallback,
                disabled: !enabledItems.includes('run'),
              },
            ],
          },
          {
            label: 'Help',
            click: buttonCallback,
            submenu: [
              {
                id: 'help-patchnotes',
                label: 'Patch notes',
                click: buttonCallback,
              },
              {
                id: 'help-discord',
                label: 'Discord invite',
                click: buttonCallback,
              },
              {
                id: 'help-help',
                label: 'Menu help',
                click: buttonCallback,
                disabled: !enabledItems.includes('help-help'),
              },
              {
                id: 'help-info',
                label: 'Game Info',
                click: buttonCallback,
                disabled: !enabledItems.includes('help-info'),
              },
              {
                id: 'help-gamelog',
                label: 'View Game Log',
                click: buttonCallback,
                disabled: !enabledItems.includes('help-gamelog'),
              },
            ],
          },
        ]}
        title={`LOUD Supreme Commander Forged Alliance Updater & Game Launcher -- Version ${version}`}
        onClose={() => remote.app.quit()}
        onMinimize={() => currentWindow.minimize()}
        onMaximize={() => currentWindow.setSize(960, 544)}
        onDoubleClick={() => currentWindow.maximize()}
      ></TitleBar>
    </>
  );
};

export default Menu;
