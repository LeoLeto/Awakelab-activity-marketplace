/**
 * Cliente del servicio de capturas (Marketplace/screenshot-service/, Node +
 * Puppeteer — ya existia y no hace falta tocarlo, se reutiliza tal cual).
 * Puerto directo de Marketplace/src/screenshot.php, usando el fetch nativo
 * de Node (disponible desde Node 18+) en vez de curl.
 *
 * Nunca debe romper la publicacion/actualizacion de un juego: cualquier
 * fallo se ignora en silencio, igual que en la version PHP.
 */
const fs = require('fs');
const path = require('path');

function screenshotUrl() {
    const hostport = process.env.SCREENSHOT_SERVICE_HOSTPORT;
    if (hostport && hostport.trim() !== '') {
        return 'http://' + hostport.trim() + '/shot';
    }
    const env = process.env.SCREENSHOT_SERVICE_URL;
    return env && env.trim() !== '' ? env : 'http://screenshot:4000/shot';
}

async function captureGameThumbnail(gameId, html) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(screenshotUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html }),
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
            return;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length === 0) {
            return;
        }

        const thumbsdir = path.join(__dirname, '..', 'public', 'thumbs');
        if (!fs.existsSync(thumbsdir)) {
            fs.mkdirSync(thumbsdir, { recursive: true });
        }
        fs.writeFileSync(path.join(thumbsdir, gameId + '.png'), buffer);
    } catch (e) {
        // Ignorado a proposito.
    }
}

module.exports = { captureGameThumbnail };
