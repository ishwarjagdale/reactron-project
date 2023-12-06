import Database, {getEpoch} from "../database";
import {spawn} from "child_process";
import path from "path";

export default class AppUsages {

    static model = `
        CREATE TABLE IF NOT EXISTS appUsages
        (
            path     TEXT,
            appName  TEXT,
            title    TEXT,
            date     DATETIME NOT NULL DEFAULT current_timestamp,
            duration INTEGER  NOT NULL
        );
    `;

    static appReader = null;
    static currentApp = null;
    static callbacks = {};

    static getAppUsages(path) {
        try {
            return Database.instance.prepare(`
                SELECT *
                FROM appUsages
                WHERE path = @path;
            `).all({path});
        } catch (e) {
            return false
        }
    }

    static insert({path, appName = "", title = "", date = Date.now(), duration = 0}) {
        try {
            const res = Database.instance.prepare(`
                INSERT INTO appUsages
                VALUES (@path,
                        @appName,
                        @title,
                        @date,
                        @duration);
            `).run({path, appName, title, date, duration});
            return Boolean(res.changes);
        } catch (e) {
            console.log(e)
            return false;
        }
    }

    static appUsagesByDate(date) {
        try {
            const res = Database.instance.prepare(`
                SELECT *,
                       SUM(duration)                                                     as duration,
                       (CASE WHEN COUNT(DISTINCT title) = 1 THEN title ELSE appName END) as appName
                FROM appUsages
                WHERE date = @date
                GROUP BY path;
            `).all({date});
            return res.map(r => (
                {
                    name: r.appName,
                    title: r.title,
                    path: r.path,
                    usage: r.duration
                }
            ));
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    static logChange(chunk) {
        try {
            if (AppUsages.currentApp) {

                if (AppUsages.currentApp.date === getEpoch(Date.now())) {
                    AppUsages.currentApp.duration = Date.now() - AppUsages.currentApp.duration;

                    AppUsages.insert(AppUsages.currentApp);
                } else {
                    AppUsages.currentApp.duration = AppUsages.currentApp.date + 864e5 - AppUsages.currentApp.duration;

                    AppUsages.insert(AppUsages.currentApp);

                    AppUsages.currentApp.date = getEpoch(Date.now());
                    AppUsages.currentApp.duration = Date.now() - AppUsages.currentApp.date;

                    AppUsages.insert(AppUsages.currentApp);
                }

            }

            if (chunk) {
                chunk = chunk.toString()
                    .split('\n')
                    .map(r => r.trim())
                    .filter(r => r.length).pop();
                const data = chunk ? JSON.parse(chunk) : undefined;

                if (data) {
                    AppUsages.currentApp = {
                        path: data.process, appName: data.name, title: data.text,
                        date: getEpoch(Date.now()), duration: Date.now()
                    }

                    Object.values(AppUsages.callbacks).forEach((cb) => cb())

                }

                else
                    AppUsages.currentApp = null;

            } else AppUsages.currentApp = null;


        } catch (e) {
            console.log(e);
        }
    }

    static start() {
        try {
            if (AppUsages.appReader) AppUsages.appReader.kill();

            const scriptPath = process.env.NODE_ENV === "development" ?
                path.resolve(__dirname, "../../src/executables/main.exe")
                :
                path.resolve(process.resourcesPath, "executables/main.exe");
            AppUsages.appReader = spawn(scriptPath);
            AppUsages.appReader.on('error', console.log);
            AppUsages.appReader.stdout.on('data', AppUsages.logChange);
        } catch (e) {
            console.log(e);
        }
    }

    static end() {
        if (AppUsages.appReader) {

            AppUsages.logChange(null);
            AppUsages.appReader.kill();

            AppUsages.appReader = null;
        }
    }

}