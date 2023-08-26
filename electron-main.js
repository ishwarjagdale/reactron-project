import {app, BrowserWindow, ipcMain, Tray, nativeImage, Menu, powerMonitor} from 'electron';
import path from "path";
import Store from "./Store";
import Logger from "./Logger";
import {ComputeScreenTime, LogScreenTime} from "./Funs";

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
let mainWindow;
let tray;
let store;
let logger;


/**
 * creates the main window of the application, if already exists .show method is called
 **/
const createWindow = () => {

    if(mainWindow) {
        mainWindow.show();
        return;
    }


    const dimensions = store.getObj('windowSize');

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: dimensions[0],
        height: dimensions[1],
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

    mainWindow.on('close', (eve) => {
        mainWindow.hide();
        eve.preventDefault();
    });

    mainWindow.on('resize', () => {
        store.setObj('windowSize', mainWindow.getSize());
    })

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY).then(null);

    // Open the DevTools.
    mainWindow.webContents.openDevTools({mode: "detach"});
};


/**
 * create the tray icon for the application and sets its menu
 **/
const createTray = () => {

    const iconPath = process.env.NODE_ENV === "development" ?
        path.resolve('src/static/img/electron.png') :
        path.resolve(process.resourcesPath, 'static/img/electron.png');
    
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.resize({width: 22}));
    tray.setTitle("BayMax: Your personal health companion")
    tray.setToolTip("BayMax: Your personal health companion")
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
    tray.on('click', () => {
        logger.log(BrowserWindow.getAllWindows().length);
        if(BrowserWindow.getAllWindows().length !== 0) mainWindow.show();
        else {
            if(!mainWindow) createWindow();
            else mainWindow.focus();
        }
    });

}


// When application is ready to launch
// handles the window frame actions
app.on('ready', () => {
    store = new Store({
        'windowSize': [1400, 800],
        'screenTime': {}
    });
    logger = new Logger();

    // adding a screenTime log if empty
    LogScreenTime("resume");


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
    ipcMain.handle('screenTime', (_event) => {
        return JSON.stringify(ComputeScreenTime(null, true));
    });
    ipcMain.handle('screenLogs', (_event, _range) => {
        return JSON.stringify(ComputeScreenTime(null, false));
    })

    // arguments passed while starting the app is logged
    logger.log("application started on boot");

    // if tray is not created then create one
    if(!tray) createTray();

    Menu.setApplicationMenu(null);

    // if argument doesn't have --hidden and there are no windows open then create one
    // --hidden argument is used to determine if the application was launched start at startup or not
    if(!process.argv.includes('--hidden') && !mainWindow) {
        createWindow();
        mainWindow?.webContents.send('screenTime', ComputeScreenTime());
    }


    powerMonitor.on('lock-screen', () => {
        LogScreenTime('suspend');
    });
    powerMonitor.on('unlock-screen', () => {
        LogScreenTime('resume');
        mainWindow?.webContents.send('updateScreenTime', JSON.stringify(ComputeScreenTime(null, true)));
    });



});


// When all the windows are closed
app.on('window-all-closed', () => {
    if(process.platform === 'darwin') app.hide();
});


app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
