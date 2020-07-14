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
import PatchNotes from './containers/patchnotes';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: colors.blue[700],
    },
    secondary: {
      main: colors.yellow[700],
    },
    background: {
      default: '#0E263E',
      paper: '#0E263E',
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
              <Router>
                <Switch>
                  <Route path="/maps">
                    <MapsLoadable />
                  </Route>
                  <Route path="/patchnotes">
                    <PatchNotes />
                  </Route>
                  <Route path="/">
                    <Menu />
                    <MainLoadable />
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
