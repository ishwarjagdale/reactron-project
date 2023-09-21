import path from "path";
import {app, Notification} from "electron";

const Database = require('better-sqlite3');


function getDate(date = null) {
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
	const yyyy = today.getFullYear();
	let mm = (today.getMonth() + 1).toString(); // Months start at 0!
	let dd = today.getDate().toString();

	mm = mm.padStart(2, '0');
	dd = dd.padStart(2, '0');

	return dd + '-' + mm + '-' + yyyy;
}

function getEpoch(date = null) {
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


class DB {
	static dbpath = null;
	static handler = new Database('');
	static statements = {};

	// to disable tracking apps when screen is locked
	static disableAppLogging = false;

	static init() {
		DB.dbpath = app.getPath("userData");
		DB.handler = new Database(path.join(DB.dbpath, "database.db"));

		DB.handler.prepare(`CREATE TABLE IF NOT EXISTS screenSessions 
							(
							    startTime DATETIME, endTime DATETIME,
							    PRIMARY KEY(startTime)
    						);`).run();

		DB.handler.prepare(`CREATE TABLE IF NOT EXISTS appUsage
                            (
                                app TEXT,
                                date DATETIME NOT NULL,
                                use DATETIME NOT NULL DEFAULT 0
                            );`).run();
		DB.handler.prepare(`CREATE TABLE IF NOT EXISTS store
                            (
                                key TEXT PRIMARY KEY,
                                value BLOB
                            );`).run();
		DB.handler.prepare(`CREATE TABLE IF NOT EXISTS config
                            (
                                key TEXT PRIMARY KEY, status BOOLEAN, options BLOB
                            );`).run();

		DB.statements.getFromStore = DB.handler.prepare(`SELECT *
                                                         FROM store
                                                         WHERE key = ?`);
		DB.statements.toStore = DB.handler.prepare(`REPLACE INTO store
                                                        VALUES (?, ?)`);
		DB.statements.getConfig = DB.handler.prepare(`SELECT *
                                                         FROM config
                                                         WHERE key = ?`);
		DB.statements.toConfig = DB.handler.prepare(`REPLACE INTO config
                                                        VALUES (?, ?, ?)`);
		DB.statements.allAppUsage = DB.handler.prepare(`SELECT app, SUM(use) as usage
                                                        FROM appUsage
                                                        WHERE date = ?
                                                        GROUP BY app`);

		DB.statements.appUsage = DB.handler.prepare(`SELECT * FROM appUsage WHERE date = ? AND app = ?`);

		DB.statements.insertAppUsage = DB.handler.prepare(`INSERT INTO appUsage VALUES (?, ?, ?)`);

		DB.statements.toStore.run('lastProcess', null);
	}

	static logApplicationChange(chunk) {
		if(DB.disableAppLogging) return

		try {
			chunk = chunk.toString().split('\n').map(r => r.trim()).filter(r => r.length).pop();
			chunk = JSON.parse(chunk);
		} catch (e) {
			chunk = undefined;
		}

		let record = DB.statements.getFromStore.get('lastProcess');
		// record = JSON-string or null in value or undefined

		if (record && record.value) {

			let lastProcess = JSON.parse(record.value);
			// lastProcess = { process: processName, epoch: unixEpoch }

			const today = getEpoch();
			const then = getEpoch(lastProcess.epoch);

			if (today !== then) {
				let usageOnThatDay = (then + 36e5 * 24) - lastProcess.epoch;
				let usageToday = Date.now() - today;

				DB.statements.insertAppUsage.run(lastProcess.process, then, usageOnThatDay);
				DB.statements.insertAppUsage.run(lastProcess.process, today, usageToday);
			} else {
				let usageToday = Date.now() - lastProcess.epoch;

				DB.statements.insertAppUsage.run(lastProcess.process, today, usageToday);
			}

		}

		DB.statements.toStore.run(
			'lastProcess',
			chunk ? JSON.stringify({process: chunk.process, epoch: Date.now()}) : null
		);

	}

	static getApplicationUsage(date = null) {
		const apps = DB.statements.allAppUsage.all(getEpoch(date));
		return apps.map(r => {
			return {
				name: r.app,
				path: r.app,
				usage: r.usage
			}
		});
	}

}

export default DB;
export {getEpoch, getDate};