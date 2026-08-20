<?php
/**
 * Sesión de administrador de Awakelab (panel de gestión de claves por colegio).
 * Sesión completamente separada de la de profesores (src/auth.php), para no
 * mezclar los dos niveles de permiso en una misma variable de sesión.
 *
 * Los admins entran con un simple nombre de usuario (sin correo real): es un
 * grupo pequeño y de confianza gestionado a mano por el propio equipo de
 * Awakelab, no hace falta el registro/verificación por correo que sí tiene
 * sentido para las cuentas de profesor (src/auth.php).
 */
require_once __DIR__ . '/db.php';

function verify_admin_login(string $username, string $password): ?array {
    $username = trim(mb_strtolower($username));

    $pdo = marketplace_db();
    $stmt = $pdo->prepare('SELECT * FROM admins WHERE username = ? AND active = 1');
    $stmt->execute([$username]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        return null;
    }

    return $admin;
}

function login_admin(array $admin): void {
    marketplace_start_session();
    $_SESSION['admin_id'] = (int) $admin['id'];
    $_SESSION['admin_username'] = $admin['username'];
}

function logout_admin(): void {
    marketplace_start_session();
    unset($_SESSION['admin_id'], $_SESSION['admin_username']);
}

function current_admin(): ?array {
    marketplace_start_session();
    if (empty($_SESSION['admin_id'])) {
        return null;
    }
    return ['id' => (int) $_SESSION['admin_id'], 'username' => $_SESSION['admin_username'] ?? ''];
}

function require_admin(): array {
    $admin = current_admin();
    if (!$admin) {
        header('Location: login.php');
        exit;
    }
    return $admin;
}

/**
 * De un solo uso: si no existe ningún admin todavía, crea uno con las
 * credenciales indicadas. Es el único momento en que se puede crear un admin
 * sin estar ya logueado como uno — a partir del primero, todos los demás se
 * crean desde admin/keys.php, ya con sesión de admin (ver create_admin()).
 */
function ensure_first_admin(string $username, string $password): void {
    $pdo = marketplace_db();
    $count = (int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
    if ($count > 0) {
        return;
    }

    $stmt = $pdo->prepare('INSERT INTO admins (username, password_hash, active, created_at) VALUES (?, ?, 1, ?)');
    $stmt->execute([trim(mb_strtolower($username)), password_hash($password, PASSWORD_DEFAULT), time()]);
}

function list_admins(): array {
    $pdo = marketplace_db();
    return $pdo->query('SELECT id, username, active, created_at FROM admins ORDER BY created_at DESC')
        ->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Crea un nuevo administrador. Solo se llama desde admin/keys.php, ya con
 * una sesión de admin válida (ver require_admin()) — nunca desde una
 * pantalla accesible sin haber entrado antes.
 */
function create_admin(string $username, string $password): array {
    $username = trim(mb_strtolower($username));

    if ($username === '') {
        return ['ok' => false, 'error' => 'Pon un nombre de usuario.'];
    }
    if (mb_strlen($password) < 8) {
        return ['ok' => false, 'error' => 'La contraseña debe tener al menos 8 caracteres.'];
    }

    $pdo = marketplace_db();
    $existing = $pdo->prepare('SELECT id FROM admins WHERE username = ?');
    $existing->execute([$username]);
    if ($existing->fetch()) {
        return ['ok' => false, 'error' => 'Ya existe un administrador con ese usuario.'];
    }

    $stmt = $pdo->prepare('INSERT INTO admins (username, password_hash, active, created_at) VALUES (?, ?, 1, ?)');
    $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT), time()]);

    return ['ok' => true, 'id' => (int) $pdo->lastInsertId()];
}

function count_active_admins(): int {
    $pdo = marketplace_db();
    return (int) $pdo->query('SELECT COUNT(*) FROM admins WHERE active = 1')->fetchColumn();
}

/**
 * Activa/revoca un administrador. Nunca se deja revocar al último admin
 * activo (dejaría el panel sin nadie que pueda entrar), ni a uno mismo desde
 * aquí (evita bloquearse la propia sesión por error) — ambas comprobaciones
 * se hacen en admin/keys.php antes de llamar a esta función.
 */
function set_admin_active(int $adminid, bool $active): void {
    $pdo = marketplace_db();
    $stmt = $pdo->prepare('UPDATE admins SET active = ? WHERE id = ?');
    $stmt->execute([$active ? 1 : 0, $adminid]);
}
