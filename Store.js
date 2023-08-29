import * as fs from "fs";
import {app} from 'electron';
import path from "path";
import {logger} from "./Logger";

class Store {
    constructor(defaults) {
        this.logger = logger;
        this.defaults = defaults;
        this.db = path.resolve(app.getPath('userData'), "reactronStore.json");
        if(!fs.existsSync(this.db))
            fs.writeFileSync(this.db, JSON.stringify(this.defaults || {}, null, 4), {
                encoding: "utf-8"
            });

        this.updateCallback = {};
    }

    subscribe(key, callback) {
        if(key in this.updateCallback) {
            this.updateCallback[key].push(callback);
        }
    }
    
    read() {
        let data;
        try {
            data = JSON.parse(fs.readFileSync(this.db, {encoding: "utf-8"}));
        } catch (e) {
            this.logger.log(e);
            data = this.defaults || {}
        }
        return data;
    }
    
    write(data) {
        try {
            fs.writeFileSync(this.db, JSON.stringify(data, null, 4), {
                encoding: "utf-8"
            });
            return true;
        } catch (e) {
            this.logger.log(e)
            return false;
        }
    }
    
    getObj(key, def= {}) {
        try {
            return this.read()[key] || def;
        } catch (e) {
            this.logger.log(e);
            return def;
        }
    }
    
    setObj(key, value) {
        try {
            const data = this.read();
            data[key] = value;
            this.write(data);
            
            for(const fun of this.updateCallback[key] || []) {
                console.log(fun);
                fun();
            }
            
            return true;
        } catch (e) {
            this.logger.log(e);
            return false;
        }
    }
}


const store = new Store({
    windowSize: [1400, 800],
    screenTime: {},
    appUsage: {
        _: {
            process: null,
            epoch: null
        }
    }
});

export {Store, store};