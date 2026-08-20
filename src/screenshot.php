<?php
/**
 * Cliente del servicio interno de capturas (screenshot-service/). Genera una
 * miniatura PNG real del juego renderizándolo en Chromium sin interfaz.
 *
 * Nunca debe romper la publicación/actualización de un juego: si el
 * servicio está caído, tarda demasiado, o el HTML da problemas al
 * renderizarlo, simplemente no se genera la miniatura esta vez (el catálogo
 * ya sabe mostrar un icono alternativo cuando no existe el archivo).
 */

/**
 * URL del servicio de capturas. En local (docker-compose) se llama
 * "screenshot" y escucha en el 4000, por eso es el valor por defecto; en
 * Render (u otro sitio) se sobreescribe con la variable de entorno
 * SCREENSHOT_SERVICE_URL, ya que ahí el nombre/puerto reales los asigna la
 * propia plataforma (ver render.yaml).
 */
function awakegame_marketplace_screenshot_url(): string {
    $env = getenv('SCREENSHOT_SERVICE_URL');
    return $env !== false && trim($env) !== '' ? $env : 'http://screenshot:4000/shot';
}

function capture_game_thumbnail(int $gameid, string $html): void {
    try {
        $curl = curl_init(awakegame_marketplace_screenshot_url());
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode(['html' => $html]),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);

        $response = curl_exec($curl);
        $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($httpcode !== 200 || $response === false || $response === '') {
            return;
        }

        $thumbsdir = __DIR__ . '/../public/thumbs';
        if (!is_dir($thumbsdir)) {
            mkdir($thumbsdir, 0775, true);
        }

        file_put_contents($thumbsdir . '/' . $gameid . '.png', $response);
    } catch (\Throwable $e) {
        // Ignorado a propósito: una miniatura fallida no debe impedir publicar.
    }
}
