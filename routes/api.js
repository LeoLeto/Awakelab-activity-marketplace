/**
 * API consumida por el plugin de Moodle y el conector LTI (autenticada con
 * la cabecera X-API-Key de cada colegio). Puerto directo de
 * Marketplace/public/api/games.php — mismo contrato exacto:
 *
 *   GET  /api/games            -> listado ligero
 *   GET  /api/games?id=123     -> detalle completo (incluye el HTML)
 *   POST /api/games            -> publicar uno nuevo
 *   POST /api/games?id=123&action=use  -> sumar un uso al contador
 *   PUT  /api/games?id=123     -> actualizar el HTML de uno ya publicado
 */
const express = require('express');
const { requireApiKey } = require('../src/apiAuth');
const { listGames, getGame, incrementGameUsage, createGame, updateGame } = require('../src/games');

const router = express.Router();

router.use(requireApiKey);

router.get('/games', (req, res) => {
    const id = Number(req.query.id || 0);

    if (id > 0) {
        const game = getGame(id);
        if (!game) {
            return res.status(404).json({ ok: false, error: 'Juego no encontrado.' });
        }
        return res.json({ ok: true, game });
    }

    const search = String(req.query.q || '').trim();
    const sort = String(req.query.sort || 'recent');
    const limit = Number(req.query.limit || 0);
    return res.json({ ok: true, games: listGames(search, sort, limit) });
});

router.post('/games', async (req, res) => {
    const id = Number(req.query.id || 0);
    const action = String(req.query.action || '');

    if (id > 0 && action === 'use') {
        incrementGameUsage(id);
        return res.json({ ok: true });
    }

    const { title, html } = req.body || {};
    if (!title || !String(title).trim() || !html || !String(html).trim()) {
        return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios: title y html.' });
    }

    const newId = await createGame(
        req.school.id,
        String(title).trim(),
        req.body.prompt ?? null,
        html,
        req.body.subject ?? null,
        req.body.source_instance_id ? Number(req.body.source_instance_id) : null
    );

    res.json({ ok: true, id: newId });
});

router.put('/games', async (req, res) => {
    const id = Number(req.query.id || 0);
    if (id <= 0) {
        return res.status(400).json({ ok: false, error: 'Falta el parámetro id.' });
    }

    const html = req.body && req.body.html;
    if (!html || !String(html).trim()) {
        return res.status(400).json({ ok: false, error: 'Falta el campo html.' });
    }

    const updated = await updateGame(id, req.school.id, html, req.body.title ?? null);
    if (!updated) {
        return res.status(404).json({ ok: false, error: 'Ese juego no existe o no pertenece a tu colegio.' });
    }

    res.json({ ok: true, status: 'updated' });
});

module.exports = router;
