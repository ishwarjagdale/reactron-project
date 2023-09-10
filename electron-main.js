import {app, BrowserWindow, ipcMain, Tray, nativeImage, Menu, powerMonitor} from 'electron';
import path from "path";
import {logger} from "./Logger";
import * as child_process from "child_process";
import DB from "./DB";

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
let appReader;


/**
 * creates the main window of the application, if already exists .show method is called
 **/
const createWindow = () => {

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
        transparent: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

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
                app.quit()
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
    DB.initApp(app.getPath('userData'));

    // if the app starts on boot, add the shutdown time to the log
    if(process.argv.includes("--start-up")) {
        const bootTime = child_process.spawnSync("pwsh", [`-Command`, 'Get-WinEvent -FilterHashtable @{logname = ‘System’; id = 1074} -MaxEvents 1 | Select -ExpandProperty "TimeCreated"']);
        DB.insertScreenLog("suspend", new Date(bootTime.stdout.toString()).getTime());
    }

    // adding a screenTime log if empty
    DB.insertScreenLog("resume");

    appReader = child_process.spawn(
        process.env.NODE_ENV === 'development' ?
            path.join(__dirname, "../../src/static/executables/main.exe")
            :
            path.join(process.resourcesPath, "static/executables/main.exe")
    );
    appReader.stdout.on('data', DB.logApplicationChange);

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

    // for the welcome page timer
    ipcMain.handle('screenTime', (_event) => {
        return JSON.stringify(DB.computeScreenTime(DB.processScreenLogs(DB.getScreenLogs(), true)));
    });

    // for the dashboard overview graphs
    ipcMain.handle('screenLogs', (_event, range) => {
        if(range <= 0) {
            return JSON.stringify(DB.processScreenLogs(DB.getScreenLogs(Date.now() + (range * (36e5 * 24)))));
        }
        else {
            const logs = {};
            const date = Date.now();
            for(let i = range - 1; i >= range - 7; i--) {
                let _d = date - (i * (36e5 * 24));
                const dayLog = DB.processScreenLogs(DB.getScreenLogs(_d));
                let dayUsage = 0;
                for(let i of dayLog) {
                    dayUsage += Math.abs(i.end - i.start);
                }
                logs[_d] = {usage: dayUsage, sessions: dayLog.length};
            }
            return JSON.stringify(logs);
        }
    })
    ipcMain.handle('appUsages', (_event, range) => {
        return range <= 0 ? JSON.stringify(DB.getApplicationUsage(Date.now() + (range * (36e5 * 24)))) : JSON.stringify(DB.getApplicationUsage(Date.now() - (range * (36e5 * 24))));
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
        mainWindow?.webContents.send('screenTime', JSON.stringify(DB.computeScreenTime(DB.processScreenLogs(DB.getScreenLogs(), true))));
    }


    powerMonitor.on('lock-screen', () => {
        DB.insertScreenLog("suspend");
    });
    powerMonitor.on('unlock-screen', () => {
        DB.insertScreenLog("resume");
        mainWindow?.webContents.send('updateScreenTime', JSON.stringify(DB.computeScreenTime(DB.processScreenLogs(DB.getScreenLogs(), true))));
    });



});


// When all the windows are closed
app.on('window-all-closed', () => {
    if(process.platform === 'darwin') app.hide();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('will-quit', () => {
    appReader.kill();
    DB.logApplicationChange("");
    DB.insertScreenLog("suspend");
})