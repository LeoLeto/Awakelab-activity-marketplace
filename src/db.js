/**
 * Conexion a la base de datos del Marketplace (SQLite, con el modulo nativo
 * "node:sqlite" incluido en Node 22+ — sincrono, sin dependencias externas
 * que compilar). Crea el fichero y el esquema automaticamente la primera vez
 * que se usa, igual que hacia marketplace_db() en la version PHP (src/db.php).
 */
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

let db = null;

function getDb() {
    if (db) {
        return db;
    }

    const datadir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(datadir)) {
        fs.mkdirSync(datadir, { recursive: true });
    }

    const dbfile = path.join(datadir, 'marketplace.sqlite');
    const isnew = !fs.existsSync(dbfile);

    db = new DatabaseSync(dbfile);
    db.exec('PRAGMA foreign_keys = ON');

    if (isnew) {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        db.exec(schema);
    } else {
        // Migracion idempotente para bases de datos ya creadas antes de que
        // existiera esta tabla (igual que marketplace_migrate() en el PHP).
        db.exec(`CREATE TABLE IF NOT EXISTS sessions (
            sid TEXT PRIMARY KEY,
            session TEXT NOT NULL,
            expires INTEGER NOT NULL
        )`);
    }

    return db;
}

module.exports = { getDb };
