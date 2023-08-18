import * as fs from "fs";
import {app} from 'electron';
import path from "path";
import Logger from "./Logger";

class Store {
    constructor(defaults) {
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
            Logger.log(e);
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
            Logger.log(e)
            return false;
        }
    }
    
    getObj(key) {
        try {
            return this.read()[key] || {};
        } catch (e) {
            Logger.log(e);
            return {};
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
            Logger.log(e);
            return false;
        }
    }
}

export default Store;