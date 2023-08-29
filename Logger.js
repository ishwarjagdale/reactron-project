import path from "path";
import {app} from "electron";
import * as fs from "fs";

class Logger {
    constructor() {
        this.logPath = path.resolve(app.getPath('userData'), 'reactron.logs');
        if(!fs.existsSync(this.logPath)) fs.writeFileSync(this.logPath, `${new Date().toISOString()} :: Reactron logs starts here\n`, {
            encoding: "utf-8"
        });
    }

    log(message) {
        if(!fs.existsSync(this.logPath)) new Logger();

        fs.writeFileSync(this.logPath, `${new Date().toISOString()} :: ${message.toString() || ''}\n`, {
            encoding: "utf-8",
            flag: 'a+'
        });
    }
}

const logger = new Logger();

export {Logger, logger};