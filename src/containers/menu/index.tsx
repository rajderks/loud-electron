import { remote } from 'electron';
import React, { FunctionComponent, useCallback, useContext } from 'react';
import TitleBar from 'frameless-titlebar';
import { MenuItem } from 'frameless-titlebar/dist/title-bar/typings';
import toggleUserContent from '../../util/toggleUserContent';
import { logEntry } from '../../util/logger';
import MainContext from '../main/MainContext';

const currentWindow = remote.getCurrentWindow();

const Menu: FunctionComponent = () => {
  const { setUserContentEnabled } = useContext(MainContext);

  const clicky = useCallback<(menu: MenuItem) => void>(
    (menu) => {
      if (menu.id === 'toggle-maps' || menu.id === 'toggle-mods') {
        const subject = menu.id === 'toggle-maps' ? 'maps' : 'mods';
        toggleUserContent(subject).subscribe((n) => {
          logEntry('Toggled user content');
          setUserContentEnabled(subject, n);
        });
      }
    },
    [setUserContentEnabled]
  );

  return (
    <>
      <TitleBar
        iconSrc={require('../../assets/loud.ico')}
        currentWindow={currentWindow} // electron window instance
        platform={process.platform as any} // win32, darwin, linux
        menu={[
          {
            label: 'Game',
            click: clicky,
          },
          {
            label: 'Tools',
            submenu: [
              {
                id: 'toggle-maps',
                label: 'Toggle user maps',
                click: clicky,
              },
              {
                id: 'toggle-mods',
                label: 'Toggle user mods',
                click: clicky,
              },
            ],
          },
          {
            label: 'Help',
            click: clicky,
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
