import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import {
  ThemeProvider,
  createMuiTheme,
  CssBaseline,
  colors,
} from '@material-ui/core';
import MapsLoadable from './containers/maps/loadable';
import Menu from './containers/menu';
import MainLoadable from './containers/main/loadable';
import './util/logger';
import MainContextProvider from './containers/main/MainContextProvider';

const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: colors.blue[700],
    },
    secondary: {
      main: colors.yellow[700],
    },
    background: {
      default: '#2A2A2A',
    },
  },
});

function App() {
  return (
    <CssBaseline>
      <ThemeProvider theme={theme}>
        <MainContextProvider>
          <div
            style={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <>
              <Menu />
              <Router>
                <Switch>
                  <Route path="/">
                    <MainLoadable />
                  </Route>
                  <Route path="/maps">
                    <MapsLoadable />
                  </Route>
                </Switch>
              </Router>
            </>
          </div>
        </MainContextProvider>
      </ThemeProvider>
    </CssBaseline>
  );
}

export default App;
