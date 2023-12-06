import {app, BrowserWindow, ipcMain, Tray, nativeImage, Menu, powerMonitor} from 'electron';
import path from "path";
import {updateElectronApp} from "update-electron-app";
import Database, {getEpoch} from "./database";
import Modules from "./modules";
import FeatureConfigurations from "./modules/FeatureConfigurations";
import Features from "./features";
import KeyStore from "./modules/KeyStore";


/**
 * creates the main window of the application, if already exists .show method is called
 **/
const createWindow = () => {

    if (mainWindow) {
        mainWindow.show();
        return;
    }

    // Create the browser window.
    Database.windows.main = mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        frame: false,
        maximizable: true,
        hasShadow: false,
        roundedCorners: false,
        center: true,
        transparent: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            devTools: true
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY).then(null);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools({mode: "detach"});
};


/**
 * create the tray icon for the application and sets its menu
 **/
const createTray = () => {

    const iconPath = process.env.NODE_ENV === "development" ?
        path.resolve('src/app/static/img/electron.png') :
        path.resolve(process.resourcesPath, 'static/img/electron.png');

    const icon = nativeImage.createFromPath(iconPath).resize({width: 22});
    tray = new Tray(icon);

    tray.setTitle("Digital Wellbeing and Desktop Companion")
    tray.setToolTip("Digital Wellbeing and Desktop Companion")

    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: "Open",
            click() {
                if (!mainWindow) createWindow(); else mainWindow.show();
            }
        },
        {
            label: "Check for updates",
            click() {
                updateElectronApp({notifyUser: true});
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
        if (!mainWindow) createWindow();
        else if (!mainWindow.isVisible()) mainWindow.show();
        else mainWindow.focus();
    });

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

updateElectronApp({notifyUser: true});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) app.quit();

// if a secondary instance tries to start primary instance's window is focused
if (!app.requestSingleInstanceLock()) app.quit();

// executes application on startup / user login with --start-up argument
if (process.env.NODE_ENV !== "development") app.setLoginItemSettings({openAtLogin: true, args: ["--start-up"]});


// global variables
let mainWindow, tray;


// database initialization
const databasePath = path.resolve(app.getPath("userData"), "database.db");
const _ = new Database(databasePath);


// When application is ready to launch
app.on('ready', () => {

    // new feature loading
    for(let key in Modules) {
        if(Modules[key].hasOwnProperty('start')) {
            Modules[key].start();
            console.log(`MODULE: ${key} started!`)
        }
    }

    for(let key in Features) {
        if(Features[key].hasOwnProperty('start')) {
            Features[key].start();
            console.log(`FEATURE: ${key} started!`)
        }
    }


    // window frame actions
    ipcMain.on('closeWindow', (_event) => {
        const window = BrowserWindow.fromWebContents(_event.sender);
        if (window === mainWindow) window.hide(); else window.close()
    });
    ipcMain.on('maximizeWindow', (_event) => {
        const window = BrowserWindow.fromWebContents(_event.sender);
        if (window.isMaximized()) window.unmaximize(); else window.maximize();
    });
    ipcMain.on('minimizeWindow', (_event) => {
        const window = BrowserWindow.fromWebContents(_event.sender);
        window.minimize();
    });

    // for the welcome page timer
    ipcMain.handle('screenTime', (_event) => {
        return JSON.stringify(Modules.Sessions.prettyTime(Modules.Sessions.getScreenTime()));
    });

    // for the dashboard overview graphs
    ipcMain.handle('screenLogs', (_event, range) => {
        if (range <= 0) {
            let temp = Modules.Sessions.getRecords( getEpoch(Date.now() + (range * (36e5 * 24))) );
            return JSON.stringify(temp);
        } else {
            const logs = {};
            const date = Date.now();
            for (let i = range; i >= range - 6; i--) {
                let _d = date - (i * (36e5 * 24));
                const dayUsage = Modules.Sessions.getScreenTime(getEpoch(_d));
                const dayLogs = Modules.Sessions.getRecords(getEpoch(_d));

                logs[_d] = {usage: dayUsage, sessions: dayLogs.length};
            }
            return JSON.stringify(logs);
        }
    })

    // for the dashboard overview donut
    ipcMain.handle('appUsages', (_event, range) => {
        let difference = range * 864e5;
        if(range > 0) difference *= -1;
        return JSON.stringify(Modules.AppUsages.appUsagesByDate(getEpoch(Date.now() + difference)))
    })

    // for getting feature configurations
    ipcMain.handle('getConfig', (_event, key) => {
        return JSON.stringify(FeatureConfigurations.get(key));
    })

    ipcMain.handle('toConfig', (_event, key, status, options) => {
        const res = FeatureConfigurations.set({key, status: status ? 1 : 0, config: options});
        if(res) Features[key]?.update();

        return JSON.stringify(FeatureConfigurations.get(key));
    })

    ipcMain.handle('appVersion', () => {
        return app.getVersion();
    })

    ipcMain.handle('toStore', (evt, key, value) => {
        if(key && value) {
            KeyStore.set(key, value);
        }
    })

    ipcMain.handle('fromStore', (evt, key) => {
        if(key) {
            return KeyStore.get(key);
        }
    })

    ipcMain.handle('fileIcon', async (evt, path) => {
        const icon = await app.getFileIcon(path);
        return icon.toDataURL();
    })

    // if tray is not created then create one
    if (!tray) createTray();

    Menu.setApplicationMenu(null);

    // if argument doesn't have --start-up and there are no windows open then create one
    // --start-up argument is used to determine if the application was launched start at startup or not
    if (!process.argv.includes('--start-up') && !mainWindow) {

        createWindow();

        mainWindow?.webContents.send('screenTime',
            JSON.stringify(
                Modules.Sessions.prettyTime(
                    Modules.Sessions.getScreenTime()
                )
            )
        );
    }


    powerMonitor.on('lock-screen', () => {
        Modules.Sessions.end();
        Modules.AppUsages.end();

        Features.R202020.end();

    });
    powerMonitor.on('unlock-screen', () => {
        Modules.Sessions.start();
        Modules.AppUsages.start();

        Features.R202020.start();

        mainWindow?.webContents.send('updateScreenTime',
            JSON.stringify(
                Modules.Sessions.prettyTime(
                    Modules.Sessions.getScreenTime()
                )
            )
        );
    });

});


// When all the windows are closed
app.on('window-all-closed', () => {
    if (process.platform === 'darwin') app.hide();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('will-quit', () => {
    Modules.AppUsages.end();
})