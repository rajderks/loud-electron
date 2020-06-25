import React from 'react';

export type MainContextItems =
  | 'louddatapathlua'
  | 'maps'
  | 'mods'
  | 'open-maps'
  | 'open-mods'
  | 'open-replays'
  | 'help-help'
  | 'help-info'
  | 'help-gamelog'
  | 'log'
  | 'iconmod'
  | 'run';

export interface IMainContext {
  enabledItems: MainContextItems[];
  changeEnabledItem: (subject: MainContextItems, enabled: boolean) => void;
}

const MainContext = React.createContext<IMainContext>({
  changeEnabledItem: () => {},
  enabledItems: [],
});

export default MainContext;
