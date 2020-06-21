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
        // iconSrc={icon} // app icon
        currentWindow={currentWindow} // electron window instance
        platform={process.platform as any} // win32, darwin, linux
        menu={[
          {
            label: 'File',
            click: clicky,
          },
        ]}
        theme={
          {
            // any theme overrides specific
            // to your application :)
          }
        }
        title="LOUD"
        onClose={() => currentWindow.close()}
        onMinimize={() => currentWindow.minimize()}
        onMaximize={() => currentWindow.maximize()}
        // when the titlebar is double clicked
        onDoubleClick={() => currentWindow.maximize()}
      >
        {/* custom titlebar items */}
      </TitleBar>
    </>
  );
};

export default Menu;
