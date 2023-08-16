import {app, BrowserWindow, ipcMain, Tray, nativeImage, Menu} from 'electron';
import * as process from "process";
import path from "path";
import * as fs from "fs";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if(require('electron-squirrel-startup')) {
    app.quit();
}

// if a secondary instance tries to start primary instance's window is focused
if(!app.requestSingleInstanceLock()) {
    app.quit();
}

// executes application on startup / user login with --hidden argument
app.setLoginItemSettings({
    openAtLogin: true,
    args: ["--hidden"]
});

// global variables
let mainWindow: BrowserWindow;
let tray: Tray;

/**
 * checks if log file exists, if not then creates one and writes initial line
 * then starts a writeStream in append mode
**/
const logPath = path.resolve(path.dirname(process.execPath), 'electronLogs.txt');
if(!fs.existsSync(logPath)) fs.writeFileSync(logPath, `${new Date().toString()} :: Log file created at ${logPath}\n`);
const log = fs.createWriteStream(logPath, {flags: 'a+'});

/**
 * Writes in the main logs
 * @param { string | object } data The object of string to write in the logs
 * @returns void
 */
const writeLog = (data: string | object) => {

    if(typeof data !== "string") {
        data = data.toString();
    }
    log.write(`${new Date().toString()} :: ${data}\n`, (err) => {
        if(err) console.log(err) // ik
    })
}

/**
 * creates the main window of the application, if already exists .show method is called
 **/
const createWindow = (): void => {

    if(mainWindow) {
        mainWindow.show();
        return;
    }

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
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.on('close', () => {
        mainWindow.hide();
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools({mode: "detach"});
};

/**
 * create the tray icon for the application and sets its menu
 **/
const createTray = (): void => {

    const iconPath = process.env.NODE_ENV === "development" ?
        path.resolve('src/static/img/electron.png') :
        path.resolve(process.resourcesPath, 'static/img/electron.png');
    
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.resize({width: 22}));
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: "Open",
            click() {
                if (!mainWindow) createWindow(); else mainWindow.show();
            }
        },
        {
            label: "Quit",
            click() {
                app.quit();
            }
        }
    ]));

}

// When application is ready to launch
// handles the window frame actions
app.on('ready', (): void => {

    // window frame actions
    ipcMain.on('closeWindow', (_event) => {
        const window = BrowserWindow.fromWebContents(_event.sender);
        if(window === mainWindow) window.hide(); else window.close()
    });
    ipcMain.on('maximizeWindow', (_event) => {
        const window = BrowserWindow.fromWebContents(_event.sender);
        if(window.isMaximized()) window.unmaximize(); else window.maximize();
    });
    ipcMain.on('minimizeWindow', (_event) => {
        const window = BrowserWindow.fromWebContents(_event.sender);
        window.minimize();
    });

    // arguments passed while starting the app is logged
    writeLog(process.argv);

    // if tray is not created then create one
    if(!tray) createTray();

    // if argument doesn't have --hidden and there are no windows open then create one
    // --hidden argument is used to determine if the application was launched start at startup or not
    if(!process.argv.includes('--hidden') && !mainWindow) createWindow();

});

// When all the windows are closed
app.on('window-all-closed', () => {
    if(process.platform === 'darwin') app.hide();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
