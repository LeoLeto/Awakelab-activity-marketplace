/**
 * Colegios y sus claves de API. Puerto directo de Marketplace/src/schools.php
 * — mismo algoritmo (SHA-256 sobre la clave en claro) via el modulo nativo
 * "crypto" de Node, compatible byte a byte con el PHP (hash('sha256', ...)).
 */
const crypto = require('crypto');
const { getDb } = require('./db');

function sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

function createSchoolKey(name) {
    const apikey = crypto.randomBytes(32).toString('hex');
    const hash = sha256(apikey);

    const db = getDb();
    const info = db.prepare(
        'INSERT INTO schools (name, api_key_hash, active, created_at) VALUES (?, ?, 1, ?)'
    ).run(name, hash, Math.floor(Date.now() / 1000));

    return { id: info.lastInsertRowid, name, apikey };
}

function listSchools() {
    const db = getDb();
    return db.prepare('SELECT id, name, active, created_at FROM schools ORDER BY created_at DESC').all();
}

function setSchoolActive(schoolId, active) {
    const db = getDb();
    db.prepare('UPDATE schools SET active = ? WHERE id = ?').run(active ? 1 : 0, schoolId);
}

function findSchoolByApiKey(apikey) {
    const hash = sha256(apikey);
    const db = getDb();
    return db.prepare('SELECT * FROM schools WHERE api_key_hash = ? AND active = 1').get(hash) || null;
}

module.exports = { createSchoolKey, listSchools, setSchoolActive, findSchoolByApiKey };
