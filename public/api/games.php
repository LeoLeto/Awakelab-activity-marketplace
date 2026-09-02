<?php
/**
 * API consumida por el plugin de Moodle (autenticada con la cabecera
 * X-API-Key de cada colegio). Sin rutas "bonitas" a propósito: todo pasa por
 * este único fichero usando el método HTTP y ?id=, para que funcione igual
 * con el servidor de desarrollo de PHP que con cualquier hosting, sin
 * depender de reglas de rewrite.
 *
 *   GET  /api/games.php            -> listado ligero
 *   GET  /api/games.php?id=123     -> detalle completo (incluye el HTML)
 *   POST /api/games.php            -> publicar uno nuevo
 *   PUT  /api/games.php?id=123     -> actualizar el HTML de uno ya publicado
 */
require_once __DIR__ . '/../../src/api_auth.php';
require_once __DIR__ . '/../../src/games.php';

header('Content-Type: application/json');

$school = require_api_key();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

if ($method === 'GET') {
    if ($id > 0) {
        $game = get_game($id);
        if (!$game) {
            api_send_error(404, 'Juego no encontrado.');
        }
        echo json_encode(['ok' => true, 'game' => $game]);
    } else {
        $search = trim($_GET['q'] ?? '');
        echo json_encode(['ok' => true, 'games' => list_games($search)]);
    }
    exit;
}

if ($method === 'POST' && $id > 0 && ($_GET['action'] ?? '') === 'use') {
    increment_game_usage($id);
    echo json_encode(['ok' => true]);
    exit;
}

if ($method === 'POST') {
    $body = read_json_body();
    $title = trim((string) ($body['title'] ?? ''));
    $html = (string) ($body['html'] ?? '');

    if ($title === '' || trim($html) === '') {
        api_send_error(400, 'Faltan campos obligatorios: title y html.');
    }

    $newid = create_game(
        (int) $school['id'],
        $title,
        $body['prompt'] ?? null,
        $html,
        $body['subject'] ?? null,
        isset($body['source_instance_id']) ? (int) $body['source_instance_id'] : null
    );

    echo json_encode(['ok' => true, 'id' => $newid]);
    exit;
}

if ($method === 'PUT') {
    if ($id <= 0) {
        api_send_error(400, 'Falta el parámetro id.');
    }

    $body = read_json_body();
    $html = (string) ($body['html'] ?? '');

    if (trim($html) === '') {
        api_send_error(400, 'Falta el campo html.');
    }

    $updated = update_game($id, (int) $school['id'], $html, isset($body['title']) ? (string) $body['title'] : null);

    if (!$updated) {
        api_send_error(404, 'Ese juego no existe o no pertenece a tu colegio.');
    }

    echo json_encode(['ok' => true, 'status' => 'updated']);
    exit;
}

api_send_error(405, 'Método no permitido.');
