/**
 * Servicio interno del Marketplace: recibe el HTML autocontenido de un
 * juego y devuelve una captura PNG de su primer fotograma, renderizándolo
 * en Chromium sin interfaz (headless). Solo lo llama src/screenshot.js (o su
 * equivalente PHP), nunca se expone al exterior — en producción se arranca
 * con pm2 igual que server.js, escuchando solo en localhost.
 */
const http = require('http');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 4000;
const VIEWPORT = { width: 640, height: 400 };

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

async function takeShot(html) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        await page.setViewport(VIEWPORT);
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 8000 });
        return await page.screenshot({ type: 'png' });
    } finally {
        await browser.close();
    }
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
        return;
    }

    if (req.method !== 'POST' || req.url !== '/shot') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'not found' }));
        return;
    }

    try {
        const raw = await readBody(req);
        const body = JSON.parse(raw || '{}');
        const html = typeof body.html === 'string' ? body.html : '';

        if (html.trim() === '') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'falta el campo html' }));
            return;
        }

        const png = await takeShot(html);
        res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': png.length });
        res.end(png);
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(err && err.message || err) }));
    }
});

server.listen(PORT, () => {
    console.log(`Servicio de capturas escuchando en el puerto ${PORT}`);
});
