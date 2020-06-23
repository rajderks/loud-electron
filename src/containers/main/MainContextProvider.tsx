import React, {
  useCallback,
  useMemo,
  useEffect,
  FunctionComponent,
  useState,
} from 'react';
import MainContext, { IMainContext } from './MainContext';
import { checkUserContent } from '../../util/toggleUserContent';

const MainContextProvider: FunctionComponent = ({ children }) => {
  const [userModsEnabled, setUserModsEnabled] = useState(false);
  const [userMapsEnabled, setUserMapsEnabled] = useState(false);

  const handleChangeUserContent: IMainContext['setUserContentEnabled'] = useCallback(
    (subject, enabled) => {
      if (subject === 'maps') {
        setUserMapsEnabled(enabled);
      } else if (subject === 'mods') {
        setUserModsEnabled(enabled);
      }
    },
    []
  );
  useEffect(() => {
    checkUserContent('mods').subscribe((n) =>
      handleChangeUserContent('mods', n)
    );
    checkUserContent('maps').subscribe((n) =>
      handleChangeUserContent('maps', n)
    );
  }, [handleChangeUserContent]);

  const contextValue = useMemo<IMainContext>(
    () => ({
      userMapsEnabled,
      userModsEnabled,
      setUserContentEnabled: handleChangeUserContent,
    }),
    [handleChangeUserContent, userMapsEnabled, userModsEnabled]
  );

  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};

export default MainContextProvider;
