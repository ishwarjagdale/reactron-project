import path from "path";
import {app} from "electron";
import * as fs from "fs";

class Logger {
    constructor(path) {
        if(!fs.existsSync(path)) fs.writeFileSync(path, `${new Date().toISOString()} :: Reactron logs starts here\n`, {
            encoding: "utf-8"
        });
    }

    static log(message) {
        const logPath = path.resolve(app.getPath('userData'), 'reactron.logs');

        if(!fs.existsSync(logPath)) new Logger();

        fs.writeFileSync(logPath, `${new Date().toISOString()} :: ${message.toString() || ''}\n`, {
            encoding: "utf-8",
            flag: 'a+'
        });
    }
}

export default Logger;