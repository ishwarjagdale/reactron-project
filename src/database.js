import BetterSqlite3 from "better-sqlite3";
import Modules from "./modules";

export function getEpoch(date = null) {
    let today;
    if (date !== null) {
        if (typeof date === "number") {
            today = new Date(date);
        } else {
            today = date;
        }
    } else {
        today = new Date();
    }
    return new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
}

class Database {
    // acting as a window manager
    static windows = {};

    static instance = null;

    constructor(databasePath = "") {
        Database.instance = this.db = new BetterSqlite3(databasePath);

        // creating tables for each feature/module
        for (let key in Modules) {
            if(Modules[key].hasOwnProperty('model')) {
                const res = this.db.prepare(Modules[key].model).run();
                if(res.changes) {
                    console.log(`DATABASE: ${key} table created!`);
                }
            }
        }
        console.log("DATABASE: synchronization completed!");
    }
}

export default Database;