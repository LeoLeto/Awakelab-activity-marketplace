/**
 * Sesion de administrador (panel de gestion de colegios/claves), separada de
 * la de profesor. Puerto directo de Marketplace/src/admin_auth.php.
 */
const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

function verifyAdminLogin(username, password) {
    username = String(username || '').trim().toLowerCase();

    const db = getDb();
    const admin = db.prepare('SELECT * FROM admins WHERE username = ? AND active = 1').get(username);
    if (!admin || !bcrypt.compareSync(String(password || ''), admin.password_hash)) {
        return null;
    }
    return admin;
}

function loginAdmin(req, admin) {
    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;
}

function logoutAdmin(req) {
    req.session.adminId = null;
    req.session.adminUsername = null;
}

function currentAdmin(req) {
    if (!req.session || !req.session.adminId) {
        return null;
    }
    return { id: req.session.adminId, username: req.session.adminUsername };
}

function requireAdmin(req, res, next) {
    const admin = currentAdmin(req);
    if (!admin) {
        res.status(401).json({ ok: false, error: 'No has iniciado sesión como administrador.' });
        return;
    }
    req.currentAdmin = admin;
    next();
}

/** De un solo uso: si no existe ningun admin todavia, crea uno sin sesion previa. */
function ensureFirstAdmin(username, password) {
    const db = getDb();
    const count = db.prepare('SELECT COUNT(*) AS c FROM admins').get().c;
    if (count > 0) {
        return;
    }
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(
        'INSERT INTO admins (username, password_hash, active, created_at) VALUES (?, ?, 1, ?)'
    ).run(String(username).trim().toLowerCase(), hash, Math.floor(Date.now() / 1000));
}

function listAdmins() {
    const db = getDb();
    return db.prepare('SELECT id, username, active, created_at FROM admins ORDER BY created_at DESC').all();
}

function createAdmin(username, password) {
    username = String(username || '').trim().toLowerCase();
    if (!username) {
        return { ok: false, error: 'Pon un nombre de usuario.' };
    }
    if (String(password || '').length < 8) {
        return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
    if (existing) {
        return { ok: false, error: 'Ya existe un administrador con ese usuario.' };
    }

    const hash = bcrypt.hashSync(password, 10);
    const info = db.prepare(
        'INSERT INTO admins (username, password_hash, active, created_at) VALUES (?, ?, 1, ?)'
    ).run(username, hash, Math.floor(Date.now() / 1000));

    return { ok: true, id: info.lastInsertRowid };
}

function countActiveAdmins() {
    const db = getDb();
    return db.prepare('SELECT COUNT(*) AS c FROM admins WHERE active = 1').get().c;
}

function setAdminActive(adminId, active) {
    const db = getDb();
    db.prepare('UPDATE admins SET active = ? WHERE id = ?').run(active ? 1 : 0, adminId);
}

module.exports = {
    verifyAdminLogin, loginAdmin, logoutAdmin, currentAdmin, requireAdmin,
    ensureFirstAdmin, listAdmins, createAdmin, countActiveAdmins, setAdminActive,
};
