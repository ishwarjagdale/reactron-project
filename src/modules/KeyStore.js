import Database from "../database";

export default class {

    static model = `
        CREATE TABLE IF NOT EXISTS keyStore
        (
            key   TEXT PRIMARY KEY,
            value BLOB
        );
    `;

    static set(key, value) {
        try {
            const res = Database.instance.prepare(`
                REPLACE INTO keyStore
                VALUES (@key, @value);
            `).run({key, value});
            return Boolean(res.changes)
        } catch (e) {
            console.log(e);
            return false;
        }

    }

    static get(key) {
        try {
            return Database.instance.prepare(`
                SELECT *
                FROM keyStore
                WHERE key = @key;
            `).get({key});
        } catch (e) {
            console.log(e)
            return false;
        }
    }

}