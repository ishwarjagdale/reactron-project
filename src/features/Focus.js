import FeatureConfigurations from "../modules/FeatureConfigurations";
import {app, BrowserWindow, screen} from "electron";
import Database from "../database";
import AppUsages from "../modules/AppUsages";


export default class Focus {
    static res = null;
    static window = null;

    static start() {
        let raw = FeatureConfigurations.get('Focus');
        if(raw) {
            raw.config = JSON.parse(raw.config || "");
        }
        const res = Focus.res = raw;

        if (res && res.status) {
            const window = Focus.window = new BrowserWindow({
                frame: false,
                minimizable: false,
                skipTaskbar: true,
                maximizable: true,
                hasShadow: false,
                roundedCorners: false,
                center: true,
                transparent: false,
                webPreferences: {
                    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    devTools: true
                },
                width: screen.getPrimaryDisplay().workAreaSize.width,
                height: screen.getPrimaryDisplay().workAreaSize.height,
            });

            const handler = () => {
                if(!window) return;
                const currentWindow = AppUsages.currentApp;
                if(!currentWindow) return;
                console.log("curr", currentWindow.path);
                console.log("is_me", currentWindow.path === app.getPath("exe"));
                if (currentWindow.path !== app.getPath("exe") &&
                    res.config.apps.filter((app) => app.path === currentWindow.path).length === 0) {
                    console.log('hey');
                    window.setAlwaysOnTop(true);
                } else {
                    window.setAlwaysOnTop(false);
                }
            }

            window.loadURL("http://localhost:3000/main_window/focus").then(() => {
                window.show();
                AppUsages.callbacks.focus = handler;
                Database.windows.main.hide();
            });

            window.on('close', () => {
                delete AppUsages.callbacks.focus;
            })

            window.on('minimize', () => {
                window.maximize();
            })

        }
    }

    static update() {
        const res = FeatureConfigurations.get('Focus')
        if(res && res.status) {
            Focus.start()
        } else {
            Focus.end();
        }
    }

    static end() {
        if(Focus.res && Focus.window) {
            Focus.window.close()
        }
    }

}