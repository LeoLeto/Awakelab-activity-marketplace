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
 *
 * $sort: 'recent' (por defecto, última actualización), 'rating' (mejor
 * valorados primero) o 'used' (más usados primero). En SQLite los NULL
 * ordenan como los valores más pequeños, así que en un ORDER BY ... DESC los
 * juegos sin valoraciones quedan al final solos — justo el orden que
 * interesa, sin tratamiento especial.
 */
function list_games(string $search = '', string $sort = 'recent', int $limit = 0): array {
    $pdo = marketplace_db();

    $sql = 'SELECT games.id, games.title, games.subject, games.updated_at, games.times_used,
                   schools.name AS school_name,
                   (SELECT AVG(stars) FROM ratings WHERE ratings.game_id = games.id) AS avg_rating,
                   (SELECT COUNT(*) FROM ratings WHERE ratings.game_id = games.id) AS rating_count
            FROM games
            JOIN schools ON schools.id = games.school_id';
    $params = [];

    $search = trim($search);
    if ($search !== '') {
        $sql .= ' WHERE games.title LIKE ? OR games.subject LIKE ?';
        $params[] = '%' . $search . '%';
        $params[] = '%' . $search . '%';
    }

    $orderby = match ($sort) {
        // "Populares": combina valoración media y usos en una sola cifra, sin
        // normalizar nada — para el tamaño de catálogo que maneja esto es
        // suficiente y facil de explicar (cada estrella de media pesa como 20
        // usos). Es el orden por defecto del catálogo.
        'popular' => '(COALESCE(avg_rating, 0) * 20 + games.times_used) DESC, games.updated_at DESC',
        'rating' => 'avg_rating DESC, games.updated_at DESC',
        'used' => 'games.times_used DESC, games.updated_at DESC',
        'published' => 'games.published_at DESC',
        default => 'games.updated_at DESC',
    };
    $sql .= ' ORDER BY ' . $orderby;

    if ($limit > 0) {
        $sql .= ' LIMIT ' . $limit;
    }

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
        'SELECT games.*, schools.name AS school_name,
                (SELECT AVG(stars) FROM ratings WHERE ratings.game_id = games.id) AS avg_rating,
                (SELECT COUNT(*) FROM ratings WHERE ratings.game_id = games.id) AS rating_count
         FROM games
         JOIN schools ON schools.id = games.school_id
         WHERE games.id = ?'
    );
    $stmt->execute([$id]);
    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    return $game ?: null;
}

/**
 * Suma un uso al contador del juego (se llama desde la API cuando un colegio
 * lo copia o lo adapta en una actividad de Moodle). No comprueba propiedad:
 * cualquier colegio autenticado puede "usar" el juego de cualquier otro, es
 * el propio punto del Marketplace.
 */
function increment_game_usage(int $id): bool {
    $pdo = marketplace_db();
    $stmt = $pdo->prepare('UPDATE games SET times_used = times_used + 1 WHERE id = ?');
    $stmt->execute([$id]);
    return $stmt->rowCount() > 0;
}

/**
 * Valora un juego (1 a 5 estrellas) en nombre de un profesor. Si ya lo había
 * valorado antes, actualiza su voto en vez de duplicarlo (índice único
 * game_id+user_id).
 */
function rate_game(int $gameid, int $userid, int $stars): array {
    if ($stars < 1 || $stars > 5) {
        return ['ok' => false, 'error' => 'La valoración debe ser de 1 a 5 estrellas.'];
    }

    $pdo = marketplace_db();
    $stmt = $pdo->prepare(
        'INSERT INTO ratings (game_id, user_id, stars, created_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(game_id, user_id) DO UPDATE SET stars = excluded.stars, created_at = excluded.created_at'
    );
    $stmt->execute([$gameid, $userid, $stars, time()]);

    return ['ok' => true];
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
