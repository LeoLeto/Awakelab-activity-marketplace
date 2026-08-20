<?php
require_once __DIR__ . '/../src/auth.php';
require_once __DIR__ . '/../src/layout.php';

if (current_user()) {
    header('Location: catalog.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = verify_login($_POST['email'] ?? '', $_POST['password'] ?? '');

    if ($user) {
        login_user($user);
        header('Location: catalog.php');
        exit;
    }

    $error = 'Correo o contraseña incorrectos.';
}

render_header('Iniciar sesión', null, null, 'auth');
?>
<div class="card">
    <h1>Bienvenido de nuevo</h1>
    <p class="sub">Entra para explorar el catálogo de juegos educativos</p>
    <?php if ($error) { render_notice($error, 'error'); } ?>
    <form method="post">
        <label for="email">Correo</label>
        <input type="email" id="email" name="email" required autofocus>

        <label for="password">Contraseña</label>
        <input type="password" id="password" name="password" required>

        <p style="margin-top:22px;"><button type="submit" class="btn-block">Entrar</button></p>
    </form>
    <p class="switch">¿No tienes cuenta? <a href="register.php">Crea una gratis</a></p>
</div>
<?php
render_footer();
