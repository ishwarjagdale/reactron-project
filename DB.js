import path from "path";
import {app} from "electron";

const Database = require('better-sqlite3');


function getDate(date=null) {
	let today;
	if(date !== null) {
		if(typeof date === "number") {
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

function getEpoch(date=null) {
	let today;
	if(date !== null) {
		if(typeof date === "number") {
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

	static initApp() {
		DB.dbpath = app.getPath("userData");
		DB.handler = new Database(path.join(DB.dbpath, "database.db"));

		DB.handler.prepare(`CREATE TABLE IF NOT EXISTS screenTime
                            (
                                date DATETIME PRIMARY KEY,
                                event BOOLEAN NOT NULL
                            );`).run()
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

		DB.statements.insertScreenLog = DB.handler.prepare(`INSERT INTO screenTime
                                                            VALUES (?, ?);`);
		DB.statements.getFromStore = DB.handler.prepare(`SELECT *
                                                         FROM store
                                                         WHERE key = ?`);
		DB.statements.toStore = DB.handler.prepare(`REPLACE INTO store
                                                        VALUES (?, ?)`);
		DB.statements.getScreenLogs = DB.handler.prepare(`SELECT *
                                                          FROM screenTime
                                                          WHERE STRFTIME('%d-%m-%Y', DATETIME(ROUND(date / 1000), 'unixepoch')) = ?`);

		DB.statements.allAppUsage = DB.handler.prepare(`SELECT app, SUM(use) as usage
                                                        FROM appUsage
                                                        WHERE date = ?
                                                        GROUP BY app`);

		DB.statements.appUsage = DB.handler.prepare(`SELECT * FROM appUsage WHERE date = ? AND app = ?`);

		DB.statements.insertAppUsage = DB.handler.prepare(`INSERT INTO appUsage VALUES (?, ?, ?)`);
	}

	static insertScreenLog(event, date = Date.now()) {

		const lastLog = DB.handler.prepare(`SELECT date, event
                                            FROM screenTime
                                            WHERE STRFTIME('%d-%m-%Y', DATETIME(ROUND(date / 1000), 'unixepoch')) = ?
                                            ORDER BY date DESC
                                                LIMIT 1;`
		).get(getDate());

		let cst = DB.statements.getFromStore.get('currentScreenTime');
		let currentScreenTime;
		if (cst === undefined) {
			DB.statements.toStore.run('currentScreenTime', 0);
			currentScreenTime = 0;
		} else {
			currentScreenTime = cst.value;
		}

		if (!lastLog) {
			if (event === "resume") {
				DB.statements.insertScreenLog.run(date, 1);
			} else {
				let epo = new Date().getMilliseconds();
				DB.statements.insertScreenLog.run(epo, 0);
				currentScreenTime += epo;
			}
		} else if (Boolean(lastLog.event) !== (event === "resume")) {
			DB.statements.insertScreenLog.run(date, event === "resume" ? 1 : 0);

			if (lastLog.event) {
				currentScreenTime += Math.abs(date - lastLog.date);
			}
		}
		DB.statements.toStore.run(currentScreenTime, 'currentScreenTime');

	}

	static getScreenLogs(date = null) {
		return DB.statements.getScreenLogs.all(getDate(date));
	}

	static processScreenLogs(logs, ms = false) {
		let timeInMilSeconds = 0;
		const procLogs = [];
		if (logs.length) {
			const epoch = getEpoch(logs[0].date);
			const nEpoch = epoch + (36e5 * 24);
			let i = 0;
			if (logs[i].event === 0) {
				procLogs.push({start: 0, end: logs[i].date - epoch});
				timeInMilSeconds += logs[i].date - epoch
				i += 1;
			}
			while (i + 1 < logs.length) {
				procLogs.push({start: logs[i].date - epoch, end: logs[i + 1].date - epoch});
				timeInMilSeconds += (logs[i + 1].date - epoch) - (logs[i].date - epoch);
				i += 2;
			}
			while (i < logs.length) {
				procLogs.push({start: logs[i].date - epoch, end: Math.min(nEpoch, Date.now()) - epoch});
				timeInMilSeconds += (Math.min(nEpoch, Date.now()) - epoch) - (logs[i].date - epoch);
				i += 1;
			}
		}
		return ms ? timeInMilSeconds : procLogs;

	}

	static computeScreenTime(timeInMilSeconds) {
		let seconds = Number.parseInt((timeInMilSeconds / 1000).toString());
		let minutes = Number.parseInt((seconds / 60).toString());
		let hours = Number.parseInt((minutes / 60).toString());

		hours %= 24;
		minutes %= 60;
		seconds %= 60;

		return {
			hours: hours,
			minutes: minutes,
			seconds: seconds
		};
	}

	static logApplicationChange(chunk) {
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

			if(today !== then) {
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
			chunk ? JSON.stringify({process: chunk.process, epoch: Date.now()}): null
		);

	}

	static getApplicationUsage(date=null) {
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