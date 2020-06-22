const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;

const path = require('path');
// const url = require('url');
const isDev = require('electron-is-dev');

// let blankWindow;
let mainWindow;

ipcMain.on('get-env', (event) => {
  event.sender.send('get-env-reply', process.env.PORTABLE_EXECUTABLE_DIR);
});

function createBlank() {
  // blankWindow = new BrowserWindow({ width: 1, height: 1 });
  createWindow();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 544,
    // icon: path.join(__dirname, 'icon.png'),
    frame: false,
    fullscreenable: false,
    maximizable: false,
    resizable: isDev ? true : true,
    fullscreen: false,
    backgroundColor: '#2A2A2A',
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
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
  mainWindow.on('closed', () => (mainWindow = null));
}

app.allowRendererProcessReuse = false;
app.on('ready', createBlank);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createBlank();
  }
});
