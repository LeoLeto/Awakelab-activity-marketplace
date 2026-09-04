/**
 * Login unificado: una sola pantalla para profesores y administradores. En
 * vez de adivinar el tipo de cuenta por la forma del identificador, se
 * intenta de verdad contra ambas tablas (admin primero, luego profesor) — así
 * un usuario de admin puede tener cualquier forma, incluida la de un correo,
 * sin ninguna restricción artificial.
 */
const express = require('express');
const { verifyLogin, loginUser, logoutUser, currentUser } = require('../src/auth');
const { verifyAdminLogin, loginAdmin, logoutAdmin, currentAdmin, ensureFirstAdmin } = require('../src/adminAuth');
const { getDb } = require('../src/db');

const router = express.Router();

router.post('/login', (req, res) => {
    const identifier = String((req.body || {}).identifier || '').trim();
    const password = (req.body || {}).password;

    const admin = verifyAdminLogin(identifier, password);
    if (admin) {
        loginAdmin(req, admin);
        return res.json({ ok: true, type: 'admin', admin: { id: admin.id, username: admin.username } });
    }

    const user = verifyLogin(identifier, password);
    if (user) {
        loginUser(req, user);
        return res.json({ ok: true, type: 'teacher', user: { id: user.id, name: user.name } });
    }

    // Ni admin ni profesor coinciden. Si todavia no existe ningun admin en
    // todo el sistema, esta primera pantalla de login sirve tambien para
    // crear la primera cuenta (igual que antes) — pero solo si el
    // identificador no tiene forma de correo, para que el primer intento de
    // login fallido de un profesor (antes de registrarse) nunca se confunda
    // con la creacion del primer administrador.
    const db = getDb();
    const noAdminsYet = db.prepare('SELECT COUNT(*) AS c FROM admins').get().c === 0;

    if (noAdminsYet && !identifier.includes('@')) {
        if (String(password || '').length < 8) {
            return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' });
        }
        ensureFirstAdmin(identifier, password);
        const newAdmin = verifyAdminLogin(identifier, password);
        loginAdmin(req, newAdmin);
        return res.json({ ok: true, type: 'admin', admin: { id: newAdmin.id, username: newAdmin.username } });
    }

    res.status(401).json({ ok: false, error: 'Usuario/correo o contraseña incorrectos.' });
});

router.post('/logout', (req, res) => {
    logoutUser(req);
    logoutAdmin(req);
    res.json({ ok: true });
});

router.get('/me', (req, res) => {
    const admin = currentAdmin(req);
    if (admin) {
        return res.json({ ok: true, type: 'admin', admin });
    }
    const user = currentUser(req);
    if (user) {
        return res.json({ ok: true, type: 'teacher', user });
    }
    res.json({ ok: true, type: null });
});

module.exports = router;
