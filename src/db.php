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
}

function marketplace_start_session(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}
