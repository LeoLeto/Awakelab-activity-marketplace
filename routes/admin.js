/**
 * Panel de administracion (colegios/claves, otros admins, listado de
 * profesores). Puerto directo de Marketplace/public/admin/keys.php y
 * users.php. El login/logout/sesion actual viven en routes/session.js
 * (unificado con el de profesor).
 */
const express = require('express');
const {
    requireAdmin, listAdmins, createAdmin, countActiveAdmins, setAdminActive,
} = require('../src/adminAuth');
const { createSchoolKey, listSchools, setSchoolActive } = require('../src/schools');
const { listUsers } = require('../src/auth');

const router = express.Router();

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
