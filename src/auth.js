/**
 * Sesion de profesor (cuentas de la web del Marketplace, independientes de
 * Moodle). Puerto directo de Marketplace/src/auth.php: bcryptjs en vez de
 * password_hash()/password_verify() de PHP (mismo algoritmo, bcrypt).
 */
const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

function registerUser(email, password, name) {
    email = String(email || '').trim().toLowerCase();
    name = String(name || '').trim();

    if (!email || !password || !name) {
        return { ok: false, error: 'Rellena todos los campos.' };
    }
    if (String(password).length < 8) {
        return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
        return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
    }

    const hash = bcrypt.hashSync(password, 10);
    const info = db.prepare(
        'INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, ?)'
    ).run(email, hash, name, Math.floor(Date.now() / 1000));

    return { ok: true, id: info.lastInsertRowid };
}

function verifyLogin(email, password) {
    email = String(email || '').trim().toLowerCase();

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(String(password || ''), user.password_hash)) {
        return null;
    }
    return user;
}

function loginUser(req, user) {
    req.session.userId = user.id;
    req.session.userName = user.name;
}

function logoutUser(req) {
    req.session.userId = null;
    req.session.userName = null;
}

function currentUser(req) {
    if (!req.session || !req.session.userId) {
        return null;
    }
    return { id: req.session.userId, name: req.session.userName };
}

/** Listado de profesores registrados, para el panel de administracion. */
function listUsers() {
    const db = getDb();
    return db.prepare('SELECT id, email, name, created_at FROM users ORDER BY created_at DESC').all();
}

/** Middleware de Express: exige sesion de profesor, 401 en JSON si no hay. */
function requireLogin(req, res, next) {
    const user = currentUser(req);
    if (!user) {
        res.status(401).json({ ok: false, error: 'No has iniciado sesión.' });
        return;
    }
    req.currentUser = user;
    next();
}

module.exports = { registerUser, verifyLogin, loginUser, logoutUser, currentUser, requireLogin, listUsers };
