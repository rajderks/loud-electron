const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

ipcMain.on('get-env', (event) => {
  event.sender.send('get-env-reply', process.env.PORTABLE_EXECUTABLE_DIR);
});

ipcMain.on('open-route', (event, route, size) => {
  let routeWindow = new BrowserWindow({
    width: (size && size[0]) || 820,
    height: (size && size[1]) || 584,
    frame: false,
    fullscreen: false,
    backgroundColor: '#0E263E',
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });
  routeWindow.loadURL(
    isDev
      ? `http://localhost:3000/index.tsx#/${route}`
      : `file://${path.join(__dirname, `../build/index.html`)}#/${route}`
  );
  routeWindow.on('closed', () => (routeWindow = null));
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 592,
    frame: false,
    fullscreenable: false,
    maximizable: false,
    resizable: isDev ? true : true,
    fullscreen: false,
    backgroundColor: '#2A2A2A',
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000/index.tsx'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

app.allowRendererProcessReuse = false;
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
