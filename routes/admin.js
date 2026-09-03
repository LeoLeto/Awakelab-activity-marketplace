/**
 * Panel de administracion (colegios/claves, otros admins, listado de
 * profesores). Puerto directo de Marketplace/public/admin/*.php.
 *
 * Se monta en /api/admin, no en /admin: /admin es la URL que ve el usuario en
 * el navegador y la atiende la SPA (web/src/AdminApp.jsx). Ver server.js.
 */
const express = require('express');
const {
    verifyAdminLogin, loginAdmin, logoutAdmin, currentAdmin, requireAdmin,
    ensureFirstAdmin, listAdmins, createAdmin, countActiveAdmins, setAdminActive,
} = require('../src/adminAuth');
const { createSchoolKey, listSchools, setSchoolActive } = require('../src/schools');
const { listUsers } = require('../src/auth');
const { getDb } = require('../src/db');

const router = express.Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body || {};

    const db = getDb();
    const noAdminsYet = db.prepare('SELECT COUNT(*) AS c FROM admins').get().c === 0;

    if (noAdminsYet) {
        if (String(password || '').length < 8) {
            return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' });
        }
        ensureFirstAdmin(username, password);
        const admin = verifyAdminLogin(username, password);
        loginAdmin(req, admin);
        return res.json({ ok: true, admin: { id: admin.id, username: admin.username } });
    }

    const admin = verifyAdminLogin(username, password);
    if (!admin) {
        return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos.' });
    }
    loginAdmin(req, admin);
    res.json({ ok: true, admin: { id: admin.id, username: admin.username } });
});

router.post('/logout', (req, res) => {
    logoutAdmin(req);
    res.json({ ok: true });
});

router.get('/me', (req, res) => {
    res.json({ ok: true, admin: currentAdmin(req) });
});

router.use(requireAdmin);

router.get('/schools', (req, res) => {
    res.json({ ok: true, schools: listSchools() });
});

router.post('/schools', (req, res) => {
    const name = String((req.body || {}).name || '').trim();
    if (!name) {
        return res.status(400).json({ ok: false, error: 'Ponle un nombre al colegio.' });
    }
    const school = createSchoolKey(name);
    res.json({ ok: true, school });
});

router.post('/schools/:id/toggle', (req, res) => {
    const active = !!(req.body || {}).active;
    setSchoolActive(Number(req.params.id), active);
    res.json({ ok: true });
});

router.get('/admins', (req, res) => {
    res.json({ ok: true, admins: listAdmins() });
});

router.post('/admins', (req, res) => {
    const { username, password } = req.body || {};
    const result = createAdmin(username, password);
    res.status(result.ok ? 200 : 400).json(result);
});

router.post('/admins/:id/toggle', (req, res) => {
    const targetId = Number(req.params.id);
    const active = !!(req.body || {}).active;

    if (targetId === req.currentAdmin.id) {
        return res.status(400).json({ ok: false, error: 'No puedes revocar tu propia cuenta.' });
    }
    if (!active && countActiveAdmins() <= 1) {
        return res.status(400).json({ ok: false, error: 'No puedes revocar al único administrador activo.' });
    }
    setAdminActive(targetId, active);
    res.json({ ok: true });
});

router.get('/users', (req, res) => {
    res.json({ ok: true, users: listUsers() });
});

module.exports = router;
