/**
 * Sesion de profesor y valoraciones. Puerto directo de Marketplace/public/
 * login.php, register.php, logout.php y rate.php — por ahora en JSON (sin
 * HTML todavia, eso es la Fase 2 con React).
 */
const express = require('express');
const { registerUser, verifyLogin, loginUser, logoutUser, currentUser, requireLogin } = require('../src/auth');
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

router.post('/login', (req, res) => {
    const { email, password } = req.body || {};
    const user = verifyLogin(email, password);
    if (!user) {
        return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos.' });
    }
    loginUser(req, user);
    res.json({ ok: true, user: { id: user.id, name: user.name } });
});

router.post('/logout', (req, res) => {
    logoutUser(req);
    res.json({ ok: true });
});

router.get('/me', (req, res) => {
    res.json({ ok: true, user: currentUser(req) });
});

router.post('/games/:id/rate', requireLogin, (req, res) => {
    const gameId = Number(req.params.id);
    const stars = Number((req.body || {}).stars);
    const result = rateGame(gameId, req.currentUser.id, stars);
    res.status(result.ok ? 200 : 400).json(result);
});

router.get('/games', requireLogin, (req, res) => {
    const q = req.query.q || '';
    const sort = req.query.sort || 'popular';
    res.json({ ok: true, games: listGames(q, sort) });
});

router.get('/games/:id', requireLogin, (req, res) => {
    const game = getGame(Number(req.params.id));
    if (!game) {
        return res.status(404).json({ ok: false, error: 'Juego no encontrado.' });
    }
    res.json({ ok: true, game });
});

module.exports = router;
