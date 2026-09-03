/**
 * Backend Node/Express del Marketplace. Sirve SOLO JSON: las paginas las
 * pinta la SPA de React (web/), que en produccion sirve nginx como estatico.
 *   /api/*        -> contrato usado por Moodle y el conector LTI (X-API-Key)
 *   /api/admin/*  -> panel de administracion (colegios/claves/admins), sesion
 *   /auth/*       -> sesion de profesor + valoraciones
 *
 * Importante: ninguno de estos prefijos puede coincidir con una ruta de la
 * SPA, o la peticion del navegador se la queda el backend y la pagina no
 * llega a cargarse nunca. Por eso el panel vive en /api/admin y no en
 * /admin, que es la URL que el usuario ve en el navegador.
 */
const path = require('path');
const express = require('express');
const session = require('express-session');

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const { SqliteSessionStore } = require('./src/sqliteSessionStore');

const app = express();

if (!process.env.SESSION_SECRET) {
    console.warn('[aviso] SESSION_SECRET no está definida: usando el secreto de desarrollo por defecto. ' +
        'Defínela como variable de entorno antes de desplegar en producción.');
}

app.use(express.json({ limit: '10mb' })); // los juegos generados con IA pueden pesar varios cientos de KB de HTML.
app.use(session({
    store: new SqliteSessionStore(), // sobrevive a los reinicios de pm2, a diferencia del MemoryStore por defecto.
    secret: process.env.SESSION_SECRET || 'awakelab-marketplace-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24h
}));

app.use('/thumbs', express.static(path.join(__dirname, 'public', 'thumbs')));

// El orden importa: '/api/admin' tiene que ir ANTES que '/api', porque
// routes/api.js aplica requireApiKey a todo lo que cuelga de el y dejaria el
// panel de administracion pidiendo una X-API-Key que el navegador no tiene.
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8100;
app.listen(PORT, () => {
    console.log(`Marketplace API (Node) escuchando en el puerto ${PORT}`);
});
