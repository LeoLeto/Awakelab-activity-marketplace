<?php
/**
 * Sesión de profesor (cuentas de la web del Marketplace, independientes de Moodle).
 */
require_once __DIR__ . '/db.php';

function register_user(string $email, string $password, string $name): array {
    $email = trim(mb_strtolower($email));

    if ($email === '' || $password === '' || $name === '') {
        return ['ok' => false, 'error' => 'Rellena todos los campos.'];
    }
    if (mb_strlen($password) < 8) {
        return ['ok' => false, 'error' => 'La contraseña debe tener al menos 8 caracteres.'];
    }

    $pdo = marketplace_db();
    $existing = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $existing->execute([$email]);
    if ($existing->fetch()) {
        return ['ok' => false, 'error' => 'Ya existe una cuenta con ese correo.'];
    }

    $stmt = $pdo->prepare(
        'INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$email, password_hash($password, PASSWORD_DEFAULT), $name, time()]);

    return ['ok' => true, 'id' => (int) $pdo->lastInsertId()];
}

function verify_login(string $email, string $password): ?array {
    $email = trim(mb_strtolower($email));

    $pdo = marketplace_db();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        return null;
    }

    return $user;
}

function login_user(array $user): void {
    marketplace_start_session();
    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['user_name'] = $user['name'];
}

function logout_user(): void {
    marketplace_start_session();
    unset($_SESSION['user_id'], $_SESSION['user_name']);
}

function current_user(): ?array {
    marketplace_start_session();
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    return ['id' => (int) $_SESSION['user_id'], 'name' => $_SESSION['user_name'] ?? ''];
}

function require_login(): array {
    $user = current_user();
    if (!$user) {
        header('Location: login.php');
        exit;
    }
    return $user;
}
