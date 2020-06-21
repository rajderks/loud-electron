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
      </ThemeProvider>
    </CssBaseline>
  );
}

export default App;
