<?php
require_once __DIR__ . '/../src/auth.php';
require_once __DIR__ . '/../src/layout.php';

if (current_user()) {
    header('Location: catalog.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $result = register_user(
        $_POST['email'] ?? '',
        $_POST['password'] ?? '',
        $_POST['name'] ?? ''
    );

    if ($result['ok']) {
        $user = verify_login($_POST['email'], $_POST['password']);
        login_user($user);
        header('Location: catalog.php');
        exit;
    }

    $error = $result['error'];
}

render_header('Crear cuenta', null, null, 'auth');
?>
<div class="card">
    <h1>Crea tu cuenta</h1>
    <p class="sub">Regístrate para navegar el catálogo de juegos educativos</p>
    <?php if ($error) { render_notice($error, 'error'); } ?>
    <form method="post">
        <label for="name">Nombre</label>
        <input type="text" id="name" name="name" required autofocus>

        <label for="email">Correo</label>
        <input type="email" id="email" name="email" required>

        <label for="password">Contraseña</label>
        <input type="password" id="password" name="password" minlength="8" required>
        <p class="help">Mínimo 8 caracteres.</p>

        <p style="margin-top:14px;"><button type="submit" class="btn-block">Crear cuenta</button></p>
    </form>
    <p class="switch">¿Ya tienes cuenta? <a href="login.php">Inicia sesión</a></p>
</div>
<?php
render_footer();
