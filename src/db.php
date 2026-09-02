<?php
/**
 * Conexión PDO a la base de datos del Marketplace (SQLite en desarrollo).
 * Crea el fichero y el esquema automáticamente la primera vez que se usa.
 */

function marketplace_db(): PDO {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $datadir = __DIR__ . '/../data';
    if (!is_dir($datadir)) {
        mkdir($datadir, 0775, true);
    }

    $dbfile = $datadir . '/marketplace.sqlite';
    $isnew = !file_exists($dbfile);

    $pdo = new PDO('sqlite:' . $dbfile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA foreign_keys = ON');

    if ($isnew) {
        $schema = file_get_contents(__DIR__ . '/schema.sql');
        $pdo->exec($schema);
    }

    marketplace_migrate($pdo);

    return $pdo;
}

/**
 * Pequeñas migraciones para bases de datos creadas con una versión anterior
 * de schema.sql (que no llevaban ciertas columnas todavía). Se comprueba en
 * cada conexión; si la columna ya existe, no hace nada.
 */
function marketplace_migrate(PDO $pdo): void {
    $columns = $pdo->query("PRAGMA table_info(admins)")->fetchAll(PDO::FETCH_COLUMN, 1);
    if (!in_array('active', $columns, true)) {
        $pdo->exec('ALTER TABLE admins ADD COLUMN active INTEGER NOT NULL DEFAULT 1');
    }
    if (!in_array('username', $columns, true) && in_array('email', $columns, true)) {
        // Los admins ya no necesitan un correo real (grupo pequeño de
        // confianza gestionado a mano); se reutiliza el valor que ya
        // tuvieran como nombre de usuario, sin perder las cuentas creadas
        // con el esquema anterior.
        $pdo->exec('ALTER TABLE admins RENAME COLUMN email TO username');
    }

    $gamescolumns = $pdo->query("PRAGMA table_info(games)")->fetchAll(PDO::FETCH_COLUMN, 1);
    if (!in_array('times_used', $gamescolumns, true)) {
        $pdo->exec('ALTER TABLE games ADD COLUMN times_used INTEGER NOT NULL DEFAULT 0');
    }

    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type = 'table'")->fetchAll(PDO::FETCH_COLUMN, 0);
    if (!in_array('ratings', $tables, true)) {
        $pdo->exec(
            'CREATE TABLE ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id INTEGER NOT NULL REFERENCES games(id),
                user_id INTEGER NOT NULL REFERENCES users(id),
                stars INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            )'
        );
        $pdo->exec('CREATE UNIQUE INDEX idx_ratings_game_user ON ratings(game_id, user_id)');
    }
}

function marketplace_start_session(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}
