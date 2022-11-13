import { ipcRenderer } from 'electron';
import React, { FunctionComponent, useCallback, useContext } from 'react';
import TitleBar from 'frameless-titlebar';
import { MenuItem } from 'frameless-titlebar/dist/title-bar/typings';
import toggleUserContent from '../../util/toggleUserContent';
import { logEntry } from '../../util/logger';
import MainContext from '../main/MainContext';
import openTarget from '../../util/openTarget';
import {
  updaterCreateLocalCRC$,
  updaterGetCRCInfo$,
  updaterCollectOutOfSyncFiles$,
  updaterParseRemoteFileContent,
} from '../../util/updater';
import rungame from '../../util/rungame';
import { version } from '../../../package.json';
import createShortcuts from '../../util/createShortcuts';
import { switchMap } from 'rxjs/operators';
import { BASE_URI } from '../../constants';
import moveIcons, { IconSet } from '../../util/moveIcons';
const remote = require('@electron/remote');

const currentWindow = remote.getCurrentWindow();

const Menu: FunctionComponent = () => {
  const { changeEnabledItem, enabledItems } = useContext(MainContext);

  const buttonCallback = useCallback<(menu: MenuItem) => void>(
    (menu) => {
      if (menu.id === 'game-run') {
        rungame();
      } else if (menu.id === 'create-shortcuts') {
        createShortcuts();
      } else if (menu.id === 'toggle-maps' || menu.id === 'toggle-mods') {
        const target = menu.id.split('-')[1] as 'maps' | 'mods';
        toggleUserContent(target).subscribe((n) => {
          logEntry(`Toggled External content | ${target} : ${n}`);
          changeEnabledItem(target, n);
        });
      } else if (
        menu.id === 'open-maps' ||
        menu.id === 'open-mods' ||
        menu.id === 'open-replays'
      ) {
        const target = menu.id.split('-')[1] as 'maps' | 'mods' | 'replays';
        openTarget(target);
      } else if (String(menu.id).startsWith('iconset')) {
        const iconSet = String(menu.id).split('-').pop();
        moveIcons(Number(iconSet) as IconSet);
      } else if (
        menu.id === 'help-help' ||
        menu.id === 'help-info' ||
        menu.id === 'help-gamelog' ||
        menu.id === 'help-gamelogFolder' ||
        menu.id === 'help-log' ||
        menu.id === 'help-logFolder' ||
        menu.id === 'help-onedrive'
      ) {
        const target = menu.id.split('-')[1] as
          | 'help'
          | 'info'
          | 'gamelog'
          | 'gamelogFolder'
          | 'log'
          | 'logFolder'
          | 'onedrive';
        openTarget(target);
      } else if (menu.id === 'create-crc') {
        updaterCreateLocalCRC$().subscribe();
      } else if (menu.id === 'list-updates') {
        updaterGetCRCInfo$({ channels: [] })
          .pipe(
            switchMap((crcInfo) => {
              const fis = updaterParseRemoteFileContent(crcInfo);
              return updaterCollectOutOfSyncFiles$(fis, BASE_URI, {
                channels: ['file'],
              });
            })
          )
          .subscribe((n) => {
            logEntry('Files that are outdated:', 'log', [
              'main',
              'log',
              'file',
            ]);
            logEntry(
              n.length === 0
                ? 'All files are up to date'
                : n.reduce(
                    (acc, fi) =>
                      acc.length > 0 ? `${acc}\r\n${fi.path}` : fi.path,
                    ''
                  ),
              'log',
              ['main', 'log', 'file']
            );
          });
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
                id: 'create-shortcuts',
                label: 'Create Shortcuts',
                click: buttonCallback,
                disabled: !enabledItems.includes('shortcut'),
              },
              // {
              //   id: 'run-iconmod',
              //   label: 'Icons Mod Installer',
              //   click: buttonCallback,
              //   disabled: !enabledItems.includes('iconmod'),
              // },
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
                label: 'Toggle External maps (FAF/Vanilla)',
                click: buttonCallback,
                disabled: !enabledItems.includes('louddatapathlua'),
              },
              {
                id: 'toggle-mods',
                label: 'Toggle External mods (FAF/Vanilla)',
                click: buttonCallback,
                disabled: !enabledItems.includes('louddatapathlua'),
              },
              {
                id: 'list-updates',
                label: 'List updates',
                click: buttonCallback,
                disabled: !enabledItems.includes('run'),
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
            label: 'Icons',
            click: buttonCallback,
            submenu: [
              {
                id: 'iconset-classic',
                label: 'Classic',
                click: buttonCallback,
                disabled: false,
              },
              {
                id: 'icons-small-menu',
                label: 'Small',
                click: buttonCallback,
                disabled: false,
                submenu: [
                  {
                    id: `iconset-small-classic-${IconSet.SmallClassic}`,
                    label: 'Small classic',
                    click: buttonCallback,
                    disabled: false,
                  },
                  {
                    id: `iconset-small-${IconSet.Small}`,
                    label: 'Small',
                    click: buttonCallback,
                    disabled: false,
                  },
                ],
              },
              {
                id: 'icons-medium-menu',
                label: 'Medium',
                click: buttonCallback,
                disabled: false,
                submenu: [
                  {
                    id: `iconset-medium-classic-${IconSet.MediumClassic}`,
                    label: 'Medium classic',
                    click: buttonCallback,
                    disabled: false,
                  },
                  {
                    id: `iconset-medium-${IconSet.Medium}`,
                    label: 'Medium',
                    click: buttonCallback,
                    disabled: false,
                  },
                ],
              },
              {
                id: 'icons-large-menu',
                label: 'Large',
                click: buttonCallback,
                disabled: false,
                submenu: [
                  {
                    id: `iconset-large-classic-${IconSet.LargeClassic}`,
                    label: 'Large classic',
                    click: buttonCallback,
                    disabled: false,
                  },
                  {
                    id: `iconset-large-${IconSet.Large}`,
                    label: 'Large',
                    click: buttonCallback,
                    disabled: false,
                  },
                ],
              },
            ],
          },
          {
            label: 'Help',
            click: buttonCallback,
            submenu: [
              {
                id: 'help-gamelog',
                label: 'View Game Log',
                click: buttonCallback,
                disabled: !enabledItems.includes('help-gamelog'),
              },
              {
                id: 'help-gamelogFolder',
                label: 'View Game Log Folder',
                click: buttonCallback,
                disabled: !enabledItems.includes('help-gamelog'),
              },
              {
                id: 'help-log',
                label: 'View Client Log',
                click: buttonCallback,
                disabled: !enabledItems.includes('log'),
              },

              {
                id: 'help-logFolder',
                label: 'View Client Log Folder',
                click: buttonCallback,
                disabled: !enabledItems.includes('log'),
              },
              {
                id: 'help-onedrive',
                label: 'Download from OneDrive',
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
