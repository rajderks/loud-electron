import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import {
  ThemeProvider,
  createMuiTheme,
  CssBaseline,
  useMediaQuery,
  colors,
} from '@material-ui/core';
import MapsLoadable from './containers/maps/loadable';
import PageHeader from './components/PageHeader';

const themeLight = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: colors.blue[700],
    },
    secondary: {
      main: colors.yellow[700],
    },
  },
});

const themeDark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: colors.blue[700],
    },
    secondary: {
      main: colors.yellow[700],
    },
  },
});

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () => (!prefersDarkMode ? themeLight : themeLight),
    [prefersDarkMode]
  );
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
          <PageHeader />
          <Router>
            <Switch>
              <Route path="/">
                <MapsLoadable />
              </Route>
            </Switch>
          </Router>
        </div>
      </ThemeProvider>
    </CssBaseline>
  );
}

export default App;
