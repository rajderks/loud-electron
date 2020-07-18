import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import {
  ThemeProvider,
  createMuiTheme,
  CssBaseline,
  colors,
} from '@material-ui/core';
import MapsLoadable from './containers/maps/loadable';
import Menu from './containers/menu';
import MainLoadable from './containers/main/loadable';
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
    text: {
      primary: '#FFFFFF',
      secondary: colors.grey[100],
    },
    background: {
      default: '#0E263E',
      paper: '#0E263E',
    },
  },
  overrides: {
    MuiInput: {
      underline: {
        '&:after': {
          borderBottomColor: colors.yellow[700],
        },
      },
    },
    MuiFormLabel: {
      root: {
        '&$focused': {
          color: colors.yellow[700],
        },
      },

      focused: {},
    },
    MuiFormControlLabel: {
      label: {
        color: '#FFFFFF',
      },
    },
    MuiSvgIcon: {
      colorPrimary: {
        color: '#FFFFFF',
      },
      colorSecondary: {
        color: colors.yellow[700],
      },
    },
  },
});

function App() {
  return (
    <CssBaseline>
      <ThemeProvider theme={theme}>
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
                {/* <Route path="/maps"> */}
                <Route path="/">
                  <MapsLoadable />
                </Route>
                <Route path="/patchnotes">
                  <PatchNotes />
                </Route>
                <Route path="/">
                  <MainContextProvider>
                    <Menu />
                    <MainLoadable />
                  </MainContextProvider>
                </Route>
              </Switch>
            </Router>
          </>
        </div>
      </ThemeProvider>
    </CssBaseline>
  );
}

export default App;
