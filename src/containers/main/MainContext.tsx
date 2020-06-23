import React from 'react';

export interface IMainContext {
  userMapsEnabled: boolean;
  userModsEnabled: boolean;
  setUserContentEnabled: (subject: 'mods' | 'maps', enabled: boolean) => void;
}

const MainContext = React.createContext<IMainContext>({
  userMapsEnabled: false,
  userModsEnabled: false,
  setUserContentEnabled: () => {},
});

export default MainContext;
