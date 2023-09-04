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
                                date
                                DATETIME
                                PRIMARY
                                KEY,
                                event
                                BOOLEAN
                                NOT
                                NULL
                            );`).run()
		DB.handler.prepare(`CREATE TABLE IF NOT EXISTS appUsage
                            (
                                app
                                TEXT,
                                title
                                TEXT,
                                date
                                DATETIME
                                NOT
                                NULL,
                                use
                                DATETIME
                                NOT
                                NULL
                                DEFAULT
                                0,
                                category
                                TEXT
                            );`).run();
		DB.handler.prepare(`CREATE TABLE IF NOT EXISTS store
                            (
                                key
                                TEXT
                                PRIMARY
                                KEY,
                                value
                                BLOB
                            )`).run();

		DB.statements.insertScreenLog = DB.handler.prepare(`INSERT INTO screenTime
                                                            VALUES (?, ?);`);
		DB.statements.getFromStore = DB.handler.prepare(`SELECT *
                                                         FROM store
                                                         WHERE key = ?`);
		DB.statements.updateStore = DB.handler.prepare(`UPDATE store
                                                        SET value = ?
                                                        WHERE key = ?`);
		DB.statements.insertIntoStore = DB.handler.prepare(`INSERT INTO store
                                                            VALUES (?, ?)`);

		DB.statements.getScreenLogs = DB.handler.prepare(`SELECT *
                                                          FROM screenTime
                                                          WHERE STRFTIME('%d-%m-%Y', DATETIME(ROUND(date / 1000), 'unixepoch')) = ?`);

		DB.statements.allAppUsage = DB.handler.prepare(`SELECT *
                                                        FROM appUsage
                                                        WHERE date = ?`);

		DB.statements.appUsage = DB.handler.prepare(`SELECT * FROM appUsage WHERE date = ? AND app = ?`);

		DB.statements.updateAppUsage = DB.handler.prepare(`UPDATE appUsage SET use = ? WHERE date = ? AND app = ?`);

		DB.statements.insertAppUsage = DB.handler.prepare(`INSERT INTO appUsage VALUES (?, null, ?, ?, null)`);
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
			DB.statements.insertIntoStore.run('currentScreenTime', 0);
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
		DB.statements.updateStore.run(currentScreenTime, 'currentScreenTime');

	}

	static getScreenLogs(date = null) {
		return DB.statements.getScreenLogs.all(getDate(date));
	}

	static processScreenLogs(logs, ms = false) {
		const epoch = getEpoch();
		let timeInMilSeconds = 0;
		const procLogs = [];
		if (logs.length) {
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
				procLogs.push({start: logs[i].date - epoch, end: Date.now() - epoch});
				timeInMilSeconds += (Date.now() - epoch) - (logs[i].date - epoch);
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
		chunk = chunk.toString().split('\n').map(r => r.trim()).filter(r => r.length).pop();
		chunk = JSON.parse(chunk);

		let lastProcess = DB.statements.getFromStore.get('lastProcess');
		if(lastProcess) lastProcess = JSON.parse(lastProcess.value);

		if (lastProcess) {
			const lastProcUsage = DB.statements.appUsage.get(getEpoch(lastProcess.epoch), lastProcess.process);
			const now = getEpoch();
			const then = getEpoch(lastProcess.epoch);

			if (now !== then) {
				let use = Math.abs(((then + (36e5 * 24)) - lastProcess.epoch));
				if (lastProcUsage) {
					DB.statements.updateAppUsage.run(lastProcUsage.use + use, then, lastProcUsage.app);
				} else {
					DB.statements.insertAppUsage.run(lastProcess.process, then, use);
				}
			}

			if (lastProcUsage) {
				let use = Math.abs(Date.now() - lastProcess.epoch);
				DB.statements.updateAppUsage.run(lastProcUsage.use + use, lastProcUsage.date, lastProcUsage.app);
			} else {
				DB.statements.insertAppUsage.run(lastProcess.process, now, Date.now() - lastProcess.epoch);
			}

			DB.statements.updateStore.run(JSON.stringify({process: chunk.process, epoch: Date.now()}), 'lastProcess');
		} else {
			DB.statements.insertIntoStore.run('lastProcess', JSON.stringify({process: chunk.process, epoch: Date.now()}));
		}
	}

	static getApplicationUsage(date=null) {
		const apps = DB.statements.allAppUsage.all(getEpoch(date));
		return apps.map(r => {
			return {
				name: r.title,
				path: r.app,
				usage: r.use
			}
		});
	}

}

export default DB;
export {getEpoch, getDate};