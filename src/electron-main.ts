import {app, BrowserWindow, ipcMain} from 'electron';
import * as process from "process";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow: BrowserWindow;

const createWindow = (): void => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        frame: false,
        maximizable: true,
        resizable: false,
        hasShadow: false,
        roundedCorners: false,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.on('close', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools({mode: "detach"});
};

app.on('ready', (): void => {

    ipcMain.on('closeWindow', (_event) => {
        const window = BrowserWindow.fromWebContents(_event.sender);
        window.close();
    });
    ipcMain.on('maximizeWindow', (_event) => {
        const window = BrowserWindow.fromWebContents(_event.sender);
        if(window.isMaximized()) window.unmaximize(); else window.maximize();
    });
    ipcMain.on('minimizeWindow', (_event) => {
        const window = BrowserWindow.fromWebContents(_event.sender);
        window.minimize();
    });

    createWindow();

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
