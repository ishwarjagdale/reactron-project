import {BrowserWindow} from "electron";
import path from "path";
import FeatureConfigurations from "../modules/FeatureConfigurations";


export default class Blinker {

    static window = null;
    static res = null;
    static eventID = null;

    static start() {
        let raw = FeatureConfigurations.get('Blinker');
        raw.config = JSON.parse(raw.config);
        const res = Blinker.res = raw;

        if (res && res.status) {
            const window = Blinker.window = new BrowserWindow({
                frame: false,
                focusable: false,
                alwaysOnTop: true,
                transparent: true,
                width: 200 * 0.5, height: 112 * 0.5,
                skipTaskbar: true,
            });
            window.center();
            window.hide();
            window.setIgnoreMouseEvents(true);
            const imgPath = path.join(process.env.NODE_ENV === "development" ? "./src/app" : process.resourcesPath, "static/svg/eye.svg");
            window.loadFile(imgPath).then(null);

            if(Blinker.eventID) clearInterval(Blinker.eventID);

            Blinker.eventID = setInterval(() => {
                window.show(); setTimeout(() => window.hide(), 1000);
            }, 4000);

        }
    }

    static update() {
        const res = FeatureConfigurations.get('Blinker')
        if(res && res.status) {
            Blinker.start()
        } else {
            Blinker.end();
        }
    }

    static end() {
        if(Blinker.eventID) {
            clearInterval(Blinker.eventID);
            Blinker.eventID = null;
        }
    }

}