/**
 * Backend Node/Express del Marketplace (Fase 1: solo API JSON, sin React
 * todavia — ver el plan de migracion). Sirve:
 *   /api/*    -> contrato usado por Moodle y el conector LTI (X-API-Key)
 *   /auth/*   -> sesion de profesor + valoraciones
 *   /admin/*  -> panel de administracion (colegios/claves/admins)
 */
const path = require('path');
const express = require('express');
const session = require('express-session');

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(express.json({ limit: '10mb' })); // los juegos generados con IA pueden pesar varios cientos de KB de HTML.
app.use(session({
    secret: process.env.SESSION_SECRET || 'awakelab-marketplace-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24h
}));

app.use('/thumbs', express.static(path.join(__dirname, 'public', 'thumbs')));

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8100;
app.listen(PORT, () => {
    console.log(`Marketplace API (Node) escuchando en el puerto ${PORT}`);
});
