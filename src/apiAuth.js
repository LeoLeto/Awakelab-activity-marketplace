/**
 * Autenticacion de las peticiones del plugin de Moodle / conector LTI
 * (maquina a maquina), via la cabecera "X-API-Key". Puerto directo de
 * Marketplace/src/api_auth.php.
 */
const { findSchoolByApiKey } = require('./schools');

function requireApiKey(req, res, next) {
    const apikey = String(req.get('X-API-Key') || '').trim();

    if (apikey === '') {
        res.status(401).json({ ok: false, error: 'Falta la cabecera X-API-Key.' });
        return;
    }

    const school = findSchoolByApiKey(apikey);
    if (!school) {
        res.status(401).json({ ok: false, error: 'Clave de API no válida o desactivada.' });
        return;
    }

    req.school = school;
    next();
}

module.exports = { requireApiKey };
