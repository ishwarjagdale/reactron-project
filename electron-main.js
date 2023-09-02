import {app, BrowserWindow, ipcMain, Tray, nativeImage, Menu, powerMonitor} from 'electron';
import path from "path";
import { store } from "./Store";
import {logger} from "./Logger";
import {ComputeScreenTime, GetAppUsages, LogApplicationChange, LogScreenTime} from "./Funs";
import * as child_process from "child_process";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if(require('electron-squirrel-startup')) {
    app.quit();
}

// if a secondary instance tries to start primary instance's window is focused
if(!app.requestSingleInstanceLock()) {
    app.quit();
}

// executes application on startup / user login with --start-up argument
app.setLoginItemSettings({
    openAtLogin: true,
    args: ["--start-up"]
});


// global variables
let mainWindow;
let tray;


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
        transparent: false,
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

    // if the app starts on boot, add the shutdown time to the log
    if(process.argv.includes("--start-up")) {
        console.log(new Date(), "umm");
        const bootTime = child_process.spawnSync("pwsh", [`-Command`, 'Get-WinEvent -FilterHashtable @{logname = ‘System’; id = 1074} -MaxEvents 1 | Select -ExpandProperty "TimeCreated"']);
        LogScreenTime("suspend", new Date(bootTime.stdout.toString()).getTime());
        console.log(new Date(), "hmm");
    }

    // adding a screenTime log if empty
    LogScreenTime("resume");
    const f = child_process.spawn(
        process.env.NODE_ENV === 'development' ?
            path.join(__dirname, "../../src/static/executables/main.exe")
            :
            path.join(process.resourcesPath, "static/executables/main.exe")
    );
    f.stdout.on('data', LogApplicationChange);

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
    ipcMain.handle('appUsages', (_event, _range) => {
        return JSON.stringify(GetAppUsages());
    })

    // arguments passed while starting the app is logged
    logger.log("application started on boot");

    // if tray is not created then create one
    if(!tray) createTray();

    Menu.setApplicationMenu(null);

    // if argument doesn't have --start-up and there are no windows open then create one
    // --start-up argument is used to determine if the application was launched start at startup or not
    if(!process.argv.includes('--start-up') && !mainWindow) {
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
