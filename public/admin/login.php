<?php
require_once __DIR__ . '/../../src/admin_auth.php';
require_once __DIR__ . '/../../src/layout.php';

if (current_admin()) {
    header('Location: keys.php');
    exit;
}

$pdo = marketplace_db();
$noadminsyet = (int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn() === 0;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($noadminsyet) {
        if (mb_strlen($password) < 8) {
            $error = 'La contraseña debe tener al menos 8 caracteres.';
        } else {
            ensure_first_admin($username, $password);
            $admin = verify_admin_login($username, $password);
            login_admin($admin);
            header('Location: keys.php');
            exit;
        }
    } else {
        $admin = verify_admin_login($username, $password);
        if ($admin) {
            login_admin($admin);
            header('Location: keys.php');
            exit;
        }
        $error = 'Usuario o contraseña incorrectos.';
    }
}

render_header('Admin', null, null, 'auth');
?>
<div class="card">
    <h1><?= $noadminsyet ? 'Crear cuenta de administrador' : 'Acceso de administración' ?></h1>
    <p class="sub"><?= $noadminsyet
        ? 'Es la primera vez: esta cuenta gestionará las claves de los colegios.'
        : 'Panel interno de Awakelab' ?></p>
    <?php if ($error) { render_notice($error, 'error'); } ?>
    <form method="post">
        <label for="username">Usuario</label>
        <input type="text" id="username" name="username" required autofocus autocomplete="username">

        <label for="password">Contraseña<?= $noadminsyet ? ' (mínimo 8 caracteres)' : '' ?></label>
        <input type="password" id="password" name="password" required autocomplete="current-password">

        <p style="margin-top:22px;"><button type="submit" class="btn-block"><?= $noadminsyet ? 'Crear cuenta y entrar' : 'Entrar' ?></button></p>
    </form>
</div>
<?php
render_footer();
