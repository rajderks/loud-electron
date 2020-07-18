import React, {
  useCallback,
  useMemo,
  useEffect,
  FunctionComponent,
  useReducer,
} from 'react';
import MainContext, { IMainContext, MainContextItems } from './MainContext';
import { checkUserContent } from '../../util/toggleUserContent';
import { logEntry, logInit } from '../../util/logger';
import { BASE_URI } from '../../constants';
import createDocumentsDirectories$ from '../../util/createDocumentsDirectories';
import { targetURI, openTargetCheck } from '../../util/openTarget';
import electron from 'electron';

interface State {
  enabledItems: MainContextItems[];
}

interface ActionEnable {
  type: 'enable';
  payload: MainContextItems;
}

interface ActionDisable {
  type: 'disable';
  payload: MainContextItems;
}

type Actions = ActionEnable | ActionDisable;

const initialState: State = {
  enabledItems: [],
};

const mainReducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case 'enable':
      if (!state.enabledItems.includes(action.payload)) {
        return {
          ...state,
          enabledItems: [...state.enabledItems, action.payload],
        };
      }
      return state;
    case 'disable':
      if (state.enabledItems.includes(action.payload)) {
        const items = state.enabledItems.slice();
        const idx = items.findIndex((i) => i === action.payload);
        if (idx > -1) {
          items.splice(idx, 1);
          return { ...state, enabledItems: items };
        }
        return state;
      }
      return state;
    default:
      return state;
  }
};

const MainContextProvider: FunctionComponent = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  logInit();

  const handleChangeEnabledItem: IMainContext['changeEnabledItem'] = useCallback(
    (item, enabled) => {
      dispatch({ type: enabled ? 'enable' : 'disable', payload: item });
    },
    []
  );
  useEffect(() => {
    checkUserContent('mods').subscribe((n) =>
      handleChangeEnabledItem('mods', n)
    );
    checkUserContent('maps').subscribe((n) =>
      handleChangeEnabledItem('maps', n)
    );
  }, [handleChangeEnabledItem]);

  const contextValue = useMemo<IMainContext>(
    () => ({
      enabledItems: state.enabledItems,
      changeEnabledItem: handleChangeEnabledItem,
    }),
    [handleChangeEnabledItem, state.enabledItems]
  );

  /* Startup checks */
  useEffect(() => {
    logEntry(
      `base uri: ${BASE_URI} (if this doesn't match your SupCom directory, file a bug report in discord and quit the client)`,
      'log',
      ['log', 'file', 'main']
    );
    logEntry(`Doc uri is ${electron.remote.app.getPath('documents')}`);
    createDocumentsDirectories$().subscribe(([target, created]) => {
      if (target === 'maps') {
        handleChangeEnabledItem('open-maps', created);
      }
      if (target === 'mods') {
        handleChangeEnabledItem('open-mods', created);
      }

      if (target === 'replays') {
        handleChangeEnabledItem('open-replays', created);
      }
      if (created) {
        logEntry(`Created ${target} folder, or it already existed`, 'log', [
          'log',
          'file',
        ]);
      } else {
        logEntry(
          `Could not create ${target} folder ${targetURI(target)}`,
          'error'
        );
      }
    });
    openTargetCheck('log').subscribe((n) => {
      handleChangeEnabledItem('log', n);
    });
    openTargetCheck('gamelog').subscribe((n) => {
      handleChangeEnabledItem('help-gamelog', n);
    });
    openTargetCheck('help').subscribe((n) => {
      handleChangeEnabledItem('help-help', n);
    });
    openTargetCheck('info').subscribe((n) => {
      handleChangeEnabledItem('help-info', n);
    });
    openTargetCheck('datapathlua').subscribe((n) => {
      handleChangeEnabledItem('louddatapathlua', n);
    });
    openTargetCheck('loud').subscribe((n) => {
      if (!n) {
        logEntry('LOUD is not install. Press the update button!');
      }
      handleChangeEnabledItem('run', n);
    });
    openTargetCheck('iconmod').subscribe((n) => {
      handleChangeEnabledItem('iconmod', n);
    });
  }, [handleChangeEnabledItem]);

  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};

export default MainContextProvider;
