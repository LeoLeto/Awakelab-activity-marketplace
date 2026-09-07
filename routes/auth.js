/**
 * Registro de profesor, catalogo y valoraciones. Puerto directo de
 * Marketplace/public/register.php, catalog.php, game.php y rate.php. El
 * login/logout/sesion actual viven en routes/session.js (unificado con el
 * de administrador).
 */
const express = require('express');
const { registerUser, verifyLogin, loginUser, requireLogin, requireLoginOrAdmin } = require('../src/auth');
const { rateGame, listGames, getGame } = require('../src/games');

const router = express.Router();

router.post('/register', (req, res) => {
    const { email, password, name } = req.body || {};
    const result = registerUser(email, password, name);
    if (!result.ok) {
        return res.status(400).json(result);
    }
    const user = verifyLogin(email, password);
    loginUser(req, user);
    res.json({ ok: true, id: result.id });
});

router.post('/games/:id/rate', requireLogin, (req, res) => {
    const gameId = Number(req.params.id);
    const stars = Number((req.body || {}).stars);
    const result = rateGame(gameId, req.currentUser.id, stars);
    res.status(result.ok ? 200 : 400).json(result);
});

router.get('/games', requireLoginOrAdmin, (req, res) => {
    const q = req.query.q || '';
    const sort = req.query.sort || 'popular';
    res.json({ ok: true, games: listGames(q, sort) });
});

router.get('/games/:id', requireLoginOrAdmin, (req, res) => {
    const game = getGame(Number(req.params.id));
    if (!game) {
        return res.status(404).json({ ok: false, error: 'Juego no encontrado.' });
    }
    res.json({ ok: true, game });
});

module.exports = router;
