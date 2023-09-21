import DB, {getDate, getEpoch} from "../DB";
import { Notification } from "electron";
import { logger } from "../Logger";

class Sessions {

	static dbAPI = {
		insert: (startTime, endTime = null) => {
			DB.handler.prepare(`INSERT INTO screenSessions VALUES (?, ?);`).run(startTime, endTime);
		},

		lastRecord: () => {
			return DB.handler.prepare(`SELECT * FROM screenSessions ORDER BY startTime DESC LIMIT 1;`).get();
		},

		updateRecord: (startTime, endTime = null) => {
			DB.handler.prepare(`UPDATE screenSessions SET endTime = ? WHERE startTime = ?;`).run(endTime, startTime);
		},

		getRecords: (date = getDate()) => {
			return DB.handler.prepare(`SELECT * FROM screenSessions WHERE STRFTIME('%d-%m-%Y', DATETIME(ROUND(startTime / 1000), 'unixepoch'), 'localtime') = ?;`)
				.all(date);
		},

		screenTime: (date = getDate()) => {
			return DB.handler.prepare(`SELECT SUM(endTime - startTime) as screenTime FROM screenSessions 
                                WHERE STRFTIME('%d-%m-%Y', DATETIME(ROUND(startTime / 1000), 'unixepoch'), 'localtime') = ? AND endTime IS NOT NULL;`)
				.get(date);
		}
	}
	static evtList = null;

	static init() {
		Sessions.newSession();
		if(Sessions.evtList == null) {
			Sessions.evtList = setInterval(() => {
				Sessions.updateSession();
			}, 60 * 1000);
		}
	}

	static end() {
		Sessions.updateSession();
		if(Sessions.evtList != null) {
			clearInterval(Sessions.evtList);
			Sessions.evtList = null;
		}
	}

	static newSession(date = Date.now(), endTime = null) {
		try {
			Sessions.dbAPI.insert(date, endTime);
		} catch (e) {
			new Notification({
				title: "Baymax",
				subtitle: "Hi, I caught an exception!",
				body: e.toString()
			});
			logger.log(e.toString());
		}
	}

	static updateSession(date = Date.now()) {
		try {
			let record = Sessions.dbAPI.lastRecord();
			if(record) {
				if(getEpoch(record.startTime) === getEpoch(date)) {
					Sessions.dbAPI.updateRecord(record.startTime, date);
				} else {
					let nextDay = getEpoch(date);
					Sessions.dbAPI.updateRecord(record.startTime, getEpoch(record.startTime) + 864e5);
					Sessions.newSession(nextDay, date);
				}
			}
		} catch (e) {
			new Notification({
				title: "Baymax",
				subtitle: "Hi, I caught an exception!",
				body: e.toString()
			});
			logger.log(e.toString());
		}
	}

	static getRecords(date = Date.now()) {
		let records = Sessions.dbAPI.getRecords(getDate(date));
		let epoch = getEpoch(date);
		records =  records.map((record, index) => {
			if(record.endTime != null) {
				return {start: record.startTime - epoch, end: record.endTime - epoch};
			} else {
				if (index === records.length - 1) {
					return {start: record.startTime - epoch, end: Date.now() - epoch};
				}
			}
		}).filter((i) => i !== undefined);
		return records;
	}

	static getScreenTime(formatted = false, date = Date.now()) {
		let screenTime = Sessions.dbAPI.screenTime(getDate(date)).screenTime;
		if (formatted) {
			return Sessions.computeScreenTime(screenTime || 0);
		} else {
			return screenTime || 0;
		}
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
}

export default Sessions;