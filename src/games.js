/**
 * Acceso a los juegos publicados. Puerto directo de Marketplace/src/games.php
 * — mismas consultas SQL, misma logica de orden/valoracion/contador de usos.
 */
const { getDb } = require('./db');
const { captureGameThumbnail } = require('./screenshot');

const SORTS = {
    // "Populares": combina valoracion media y usos en una sola cifra, sin
    // normalizar nada — para el tamano de catalogo que maneja esto es
    // suficiente y facil de explicar (cada estrella de media pesa como 20
    // usos). Es el orden por defecto del catalogo (ver Fase 2, React).
    popular: '(COALESCE(avg_rating, 0) * 20 + games.times_used) DESC, games.updated_at DESC',
    rating: 'avg_rating DESC, games.updated_at DESC',
    used: 'games.times_used DESC, games.updated_at DESC',
    published: 'games.published_at DESC',
    recent: 'games.updated_at DESC',
};

function listGames(search = '', sort = 'recent', limit = 0) {
    const db = getDb();

    let sql = `SELECT games.id, games.title, games.subject, games.updated_at, games.times_used,
                      schools.name AS school_name,
                      (SELECT AVG(stars) FROM ratings WHERE ratings.game_id = games.id) AS avg_rating,
                      (SELECT COUNT(*) FROM ratings WHERE ratings.game_id = games.id) AS rating_count
               FROM games
               JOIN schools ON schools.id = games.school_id`;
    const params = [];

    search = String(search || '').trim();
    if (search !== '') {
        sql += ' WHERE games.title LIKE ? OR games.subject LIKE ?';
        params.push('%' + search + '%', '%' + search + '%');
    }

    sql += ' ORDER BY ' + (SORTS[sort] || SORTS.recent);

    if (limit > 0) {
        sql += ' LIMIT ' + Number(limit);
    }

    return db.prepare(sql).all(...params);
}

function getGame(id) {
    const db = getDb();
    const game = db.prepare(
        `SELECT games.*, schools.name AS school_name,
                (SELECT AVG(stars) FROM ratings WHERE ratings.game_id = games.id) AS avg_rating,
                (SELECT COUNT(*) FROM ratings WHERE ratings.game_id = games.id) AS rating_count
         FROM games
         JOIN schools ON schools.id = games.school_id
         WHERE games.id = ?`
    ).get(id);
    return game || null;
}

/**
 * Suma un uso al contador del juego. Sin comprobacion de propiedad: cualquier
 * colegio autenticado puede "usar" el juego de cualquier otro, es el propio
 * punto del Marketplace.
 */
function incrementGameUsage(id) {
    const db = getDb();
    const info = db.prepare('UPDATE games SET times_used = times_used + 1 WHERE id = ?').run(id);
    return info.changes > 0;
}

/**
 * Valora un juego (1 a 5 estrellas). Si ya lo habia valorado antes, actualiza
 * su voto en vez de duplicarlo (indice unico game_id+user_id).
 */
function rateGame(gameId, userId, stars) {
    stars = Number(stars);
    if (stars < 1 || stars > 5) {
        return { ok: false, error: 'La valoración debe ser de 1 a 5 estrellas.' };
    }

    const db = getDb();
    db.prepare(
        `INSERT INTO ratings (game_id, user_id, stars, created_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(game_id, user_id) DO UPDATE SET stars = excluded.stars, created_at = excluded.created_at`
    ).run(gameId, userId, stars, Math.floor(Date.now() / 1000));

    return { ok: true };
}

async function createGame(schoolId, title, prompt, html, subject, sourceInstanceId) {
    const db = getDb();
    const now = Math.floor(Date.now() / 1000);

    const info = db.prepare(
        `INSERT INTO games (school_id, source_instance_id, title, prompt, subject, html, published_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(schoolId, sourceInstanceId ?? null, title, prompt ?? null, subject ?? null, html, now, now);

    const id = info.lastInsertRowid;
    await captureGameThumbnail(id, html);

    return id;
}

/**
 * Actualiza un juego ya publicado. Devuelve false si el juego no existe o no
 * pertenece al colegio indicado (para que la API pueda responder 403/404 sin
 * dejar que un colegio sobrescriba el juego de otro).
 */
async function updateGame(id, schoolId, html, title = null) {
    const db = getDb();

    const row = db.prepare('SELECT school_id FROM games WHERE id = ?').get(id);
    if (!row || row.school_id !== schoolId) {
        return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (title !== null) {
        db.prepare('UPDATE games SET html = ?, title = ?, updated_at = ? WHERE id = ?').run(html, title, now, id);
    } else {
        db.prepare('UPDATE games SET html = ?, updated_at = ? WHERE id = ?').run(html, now, id);
    }

    await captureGameThumbnail(id, html);

    return true;
}

module.exports = { listGames, getGame, incrementGameUsage, rateGame, createGame, updateGame };
