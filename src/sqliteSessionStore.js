/**
 * Almacen de sesiones persistente en la misma base SQLite del Marketplace,
 * en vez del MemoryStore por defecto de express-session (que pierde todas
 * las sesiones -de profesores y de admins- en cada reinicio de pm2).
 */
const session = require('express-session');
const { getDb } = require('./db');

class SqliteSessionStore extends session.Store {
    constructor() {
        super();
        this.db = getDb();
    }

    expiresFor(sessionData) {
        const cookie = sessionData.cookie || {};
        if (cookie.expires) {
            return Math.floor(new Date(cookie.expires).getTime() / 1000);
        }
        const maxAgeMs = typeof cookie.maxAge === 'number' ? cookie.maxAge : 1000 * 60 * 60 * 24;
        return Math.floor((Date.now() + maxAgeMs) / 1000);
    }

    get(sid, callback) {
        try {
            const now = Math.floor(Date.now() / 1000);
            const row = this.db.prepare('SELECT session, expires FROM sessions WHERE sid = ?').get(sid);
            if (!row || row.expires < now) {
                return callback(null, null);
            }
            callback(null, JSON.parse(row.session));
        } catch (err) {
            callback(err);
        }
    }

    set(sid, sessionData, callback) {
        try {
            const expires = this.expiresFor(sessionData);
            this.db.prepare(
                `INSERT INTO sessions (sid, session, expires) VALUES (?, ?, ?)
                 ON CONFLICT(sid) DO UPDATE SET session = excluded.session, expires = excluded.expires`
            ).run(sid, JSON.stringify(sessionData), expires);

            // Limpieza oportunista de sesiones caducadas, sin necesidad de un cron aparte.
            this.db.prepare('DELETE FROM sessions WHERE expires < ?').run(Math.floor(Date.now() / 1000));

            callback && callback(null);
        } catch (err) {
            callback && callback(err);
        }
    }

    touch(sid, sessionData, callback) {
        this.set(sid, sessionData, callback);
    }

    destroy(sid, callback) {
        try {
            this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
            callback && callback(null);
        } catch (err) {
            callback && callback(err);
        }
    }
}

module.exports = { SqliteSessionStore };
