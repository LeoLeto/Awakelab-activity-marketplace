<?php
/**
 * Acceso a los juegos publicados. Usado tanto por la web (catálogo, con
 * login de profesor) como por la API (con clave de colegio) — es la misma
 * fuente de datos, solo cambia quién puede llamarla y qué campos se exponen.
 */
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/screenshot.php';

/**
 * Listado ligero (sin el HTML completo) para el catálogo web y para el
 * selector "Usar del Marketplace" del plugin de Moodle.
 */
function list_games(string $search = ''): array {
    $pdo = marketplace_db();

    $sql = 'SELECT games.id, games.title, games.subject, games.updated_at, schools.name AS school_name
            FROM games
            JOIN schools ON schools.id = games.school_id';
    $params = [];

    $search = trim($search);
    if ($search !== '') {
        $sql .= ' WHERE games.title LIKE ? OR games.subject LIKE ?';
        $params[] = '%' . $search . '%';
        $params[] = '%' . $search . '%';
    }

    $sql .= ' ORDER BY games.updated_at DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Detalle completo (incluye el HTML) de un juego, para previsualizarlo en la
 * web o para clonarlo dentro de una actividad de Moodle.
 */
function get_game(int $id): ?array {
    $pdo = marketplace_db();
    $stmt = $pdo->prepare(
        'SELECT games.*, schools.name AS school_name
         FROM games
         JOIN schools ON schools.id = games.school_id
         WHERE games.id = ?'
    );
    $stmt->execute([$id]);
    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    return $game ?: null;
}

function create_game(int $schoolid, string $title, ?string $prompt, string $html, ?string $subject, ?int $sourceinstanceid): int {
    $pdo = marketplace_db();
    $now = time();

    $stmt = $pdo->prepare(
        'INSERT INTO games (school_id, source_instance_id, title, prompt, subject, html, published_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$schoolid, $sourceinstanceid, $title, $prompt, $subject, $html, $now, $now]);

    $id = (int) $pdo->lastInsertId();
    capture_game_thumbnail($id, $html);

    return $id;
}

/**
 * Actualiza un juego ya publicado. Devuelve false si el juego no existe o no
 * pertenece al colegio indicado (para que la API pueda responder 403/404 sin
 * dejar que un colegio sobrescriba el juego de otro).
 */
function update_game(int $id, int $schoolid, string $html, ?string $title = null): bool {
    $pdo = marketplace_db();

    $stmt = $pdo->prepare('SELECT school_id FROM games WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || (int) $row['school_id'] !== $schoolid) {
        return false;
    }

    if ($title !== null) {
        $stmt = $pdo->prepare('UPDATE games SET html = ?, title = ?, updated_at = ? WHERE id = ?');
        $stmt->execute([$html, $title, time(), $id]);
    } else {
        $stmt = $pdo->prepare('UPDATE games SET html = ?, updated_at = ? WHERE id = ?');
        $stmt->execute([$html, time(), $id]);
    }

    capture_game_thumbnail($id, $html);

    return true;
}
