import Database, {getEpoch} from "../database";

export default class Sessions {

    static model = `
        CREATE TABLE IF NOT EXISTS sessions
        (
            start    DATETIME PRIMARY KEY,
            end      DATETIME NOT NULL,
            finished BOOLEAN  NOT NULL DEFAULT 0
        );
    `;

    static currentSession = null;
    static eventID = null;

    static newSession({start = Date.now(), end = Date.now(), finished = 0}) {
        try {
            const res = Database.instance.prepare(`
                INSERT INTO sessions
                VALUES (@start, @end, @finished);
            `).run({start, end, finished})
            return Boolean(res.changes);
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    static updateSession({start, end = Date.now(), finished = 0}) {
        try {
            const statement = Database.instance.prepare(`
                UPDATE sessions
                SET end      = @end,
                    finished = @finished
                WHERE start = @start;
            `);

            if (getEpoch(Sessions.currentSession) === getEpoch(end)) {
                const res = statement.run({start, end, finished})
                return Boolean(res.changes);
            } else {
                statement.run({start, end: start + 864e5, finished: 1});

                const res = statement.run({start: getEpoch(end), end, finished: 0});
                Sessions.currentSession = getEpoch(end);

                return Boolean(res.changes);
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    static start() {
        const obj = {start: Date.now(), end: Date.now(), finished: 0};

        if (!Sessions.newSession(obj)) {
            console.log("Session couldn't start");
            return;
        }

        if (Sessions.eventID) {
            clearInterval(Sessions.eventID);
            Sessions.eventID = null;
            Sessions.currentSession = null;
        }

        Sessions.currentSession = obj.start;

        Sessions.eventID = setInterval(() => {
            if (!Sessions.updateSession({start: Sessions.currentSession})) {
                console.log("Session update failed");
            }
        }, 60 * 1000);
    }

    static end() {
        if (!Sessions.updateSession({start: Sessions.currentSession, finished: 1})) {
            console.log("Session couldn't end");
            return false;
        }

        if (Sessions.eventID) {
            clearInterval(Sessions.eventID);
            Sessions.eventID = null;
        }
    }

    static getRecords(date = getEpoch(Date.now())) {
        try {
            return Database.instance.prepare(`
                SELECT (start - @date) as start, (end - @date) as end, finished
                FROM sessions
                WHERE start >= @date
                  AND end <= (@date + 864e5);
            `).all({date});
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    static getScreenTime(date = getEpoch(Date.now())) {
        try {
            return Database.instance.prepare(`
                SELECT SUM(end - start) as total
                FROM sessions
                WHERE start >= @date
                  AND end <= (@date + 864e5);
            `).get({date}).total;
        } catch (e) {
            console.log(e);
            return 0
        }
    }

    static prettyTime(ms) {
        let seconds = Number.parseInt(ms / 1000);
        let minutes = Number.parseInt(seconds / 60);
        let hours = Number.parseInt(minutes / 60);

        hours %= 24;
        minutes %= 60;
        seconds %= 60;

        return {hours: hours, minutes: minutes, seconds: seconds};
    }

}