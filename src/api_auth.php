<?php
/**
 * Autenticación de las peticiones del plugin de Moodle (máquina a máquina),
 * vía la cabecera "X-API-Key". Nunca se guarda la clave en claro (ver
 * schools.php): se compara el hash de la clave recibida contra el hash
 * guardado, igual que una contraseña.
 */
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/schools.php';

function require_api_key(): array {
    // $_SERVER['HTTP_X_API_KEY'] es la forma más fiable de leer una cabecera
    // personalizada, disponible en cualquier combinación de servidor web/PHP
    // (Apache+mod_php, nginx+PHP-FPM, el servidor embebido de PHP...).
    // getallheaders() solo existe con SAPIs tipo Apache, así que se usa como
    // respaldo por si algún proxy la normaliza de otra forma.
    $apikey = trim((string) ($_SERVER['HTTP_X_API_KEY'] ?? ''));

    if ($apikey === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp($name, 'X-API-Key') === 0) {
                $apikey = trim($value);
                break;
            }
        }
    }

    if ($apikey === '') {
        api_send_error(401, 'Falta la cabecera X-API-Key.');
    }

    $school = find_school_by_api_key($apikey);
    if (!$school) {
        api_send_error(401, 'Clave de API no válida o desactivada.');
    }

    return $school;
}

function api_send_error(int $httpcode, string $message): void {
    http_response_code($httpcode);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}
