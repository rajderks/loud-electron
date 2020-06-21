import { remote } from 'electron';
import React, { FunctionComponent, useCallback } from 'react';
import TitleBar from 'frameless-titlebar';
import { MenuItem } from 'frameless-titlebar/dist/title-bar/typings';
// import icon from '../assets/logo512.png';

const currentWindow = remote.getCurrentWindow();

const Menu: FunctionComponent = () => {
  const clicky = useCallback<(menu: MenuItem) => void>((menu) => {
    console.warn(menu);
  }, []);
  return (
    <>
      <TitleBar
        // icon={
        //   <div
        //     style={{
        //       backgroundImage: `url('${require('../../assets/logo512.png')}')`,
        //     }}
        //   />
        // } // app icon
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
            click: clicky,
          },
          {
            label: 'Help',
            click: clicky,
          },
        ]}
        theme={
          {
            // any theme overrides specific
            // to your application :)
          }
        }
        title="LOUD Supreme Commander Forged Alliance Updater & Game Launcher -- Version 5.00"
        onClose={() => currentWindow.close()}
        onMinimize={() => currentWindow.minimize()}
        onMaximize={() => currentWindow.setSize(960, 544)}
        // when the titlebar is double clicked
        onDoubleClick={() => currentWindow.maximize()}
      >
        {/* custom titlebar items */}
      </TitleBar>
    </>
  );
};

export default Menu;
