<?php
/**
 * Colegios y sus claves de API. La clave en claro solo existe en el momento
 * de crearla (se devuelve una vez a quien la crea desde el panel admin); a
 * partir de ahí solo se guarda su hash SHA-256, igual que una contraseña, así
 * que si la base de datos se filtrara no se podría suplantar a ningún colegio.
 */
require_once __DIR__ . '/db.php';

/**
 * Crea un colegio nuevo con una clave de API generada al azar.
 *
 * @return array{id: int, name: string, apikey: string} La clave (apikey) solo
 *         se devuelve aquí; no se puede recuperar después.
 */
function create_school_key(string $name): array {
    $apikey = bin2hex(random_bytes(32));
    $hash = hash('sha256', $apikey);

    $pdo = marketplace_db();
    $stmt = $pdo->prepare(
        'INSERT INTO schools (name, api_key_hash, active, created_at) VALUES (?, ?, 1, ?)'
    );
    $stmt->execute([$name, $hash, time()]);

    return ['id' => (int) $pdo->lastInsertId(), 'name' => $name, 'apikey' => $apikey];
}

function list_schools(): array {
    $pdo = marketplace_db();
    return $pdo->query('SELECT id, name, active, created_at FROM schools ORDER BY created_at DESC')
        ->fetchAll(PDO::FETCH_ASSOC);
}

function set_school_active(int $schoolid, bool $active): void {
    $pdo = marketplace_db();
    $stmt = $pdo->prepare('UPDATE schools SET active = ? WHERE id = ?');
    $stmt->execute([$active ? 1 : 0, $schoolid]);
}

function find_school_by_api_key(string $apikey): ?array {
    $hash = hash('sha256', $apikey);

    $pdo = marketplace_db();
    $stmt = $pdo->prepare('SELECT * FROM schools WHERE api_key_hash = ? AND active = 1');
    $stmt->execute([$hash]);
    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    return $school ?: null;
}
