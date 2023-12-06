import Database from "../database";

export default class {

    static model = `
        CREATE TABLE IF NOT EXISTS featureConfigurations
        (
            key    TEXT PRIMARY KEY,
            status BOOLEAN NOT NULL DEFAULT 0,
            config BLOB
        );
    `;

    static set({key, status = 0, config = {}}) {
        try {
            const res = Database.instance.prepare(`
                REPLACE INTO featureConfigurations
                VALUES (@key, @status, @config);
            `).run({key, status, config});
            return Boolean(res.changes);
        } catch (e) {
            console.log(e);
            return false
        }
    }

    static setStatus({key, status = 0}) {
        try {
            const res = Database.instance.prepare(`
                UPDATE featureConfigurations
                SET status = @status
                WHERE key = @key;
            `).run({key, status});
            return Boolean(res.changes);
        } catch (e) {
            console.log(e);
            return false
        }
    }

    static get(key) {
        try {
            return Database.instance.prepare(`
                SELECT *
                FROM featureConfigurations
                WHERE key = @key;
            `).get({key});
        } catch (e) {
            console.log(e)
            return false;
        }
    }

}