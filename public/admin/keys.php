<?php
require_once __DIR__ . '/../../src/admin_auth.php';
require_once __DIR__ . '/../../src/schools.php';
require_once __DIR__ . '/../../src/layout.php';

$admin = require_admin();
$newkey = null;
$error = '';
$adminerror = '';
$adminok = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $name = trim($_POST['name'] ?? '');
        if ($name === '') {
            $error = 'Ponle un nombre al colegio.';
        } else {
            $newkey = create_school_key($name);
        }
    } else if ($action === 'toggle') {
        $schoolid = (int) ($_POST['school_id'] ?? 0);
        $active = ($_POST['active'] ?? '') === '1';
        set_school_active($schoolid, $active);
        header('Location: keys.php');
        exit;
    } else if ($action === 'create_admin') {
        $result = create_admin($_POST['admin_username'] ?? '', $_POST['admin_password'] ?? '');
        if ($result['ok']) {
            $adminok = true;
        } else {
            $adminerror = $result['error'];
        }
    } else if ($action === 'toggle_admin') {
        $targetid = (int) ($_POST['admin_id'] ?? 0);
        $active = ($_POST['active'] ?? '') === '1';

        if ($targetid === (int) $admin['id']) {
            $adminerror = 'No puedes revocar tu propia cuenta.';
        } else if (!$active && count_active_admins() <= 1) {
            $adminerror = 'No puedes revocar al único administrador activo.';
        } else {
            set_admin_active($targetid, $active);
            header('Location: keys.php');
            exit;
        }
    }
}

$schools = list_schools();
$activecount = count(array_filter($schools, fn($s) => (int) $s['active'] === 1));
$admins = list_admins();

render_header('Claves de colegios', 'Salir', 'logout.php');
?>
<div class="hero">
    <div class="eyebrow">Panel de administración</div>
    <h1>Colegios y claves de API</h1>
    <p class="lead">Cada colegio necesita su propia clave para publicar juegos en el Marketplace. Genérala aquí y pásasela a quien administre su Moodle.</p>
    <p style="margin-top:10px;"><a href="users.php" class="btn btn-secondary btn-sm">&#128101; Ver profesores registrados</a></p>
</div>

<div style="display:flex; gap:16px; margin-bottom:22px;">
    <div class="card" style="flex:1; margin-bottom:0; text-align:center;">
        <div style="font-size:28px; font-weight:800; color:var(--cian);"><?= count($schools) ?></div>
        <div class="muted">Colegios totales</div>
    </div>
    <div class="card" style="flex:1; margin-bottom:0; text-align:center;">
        <div style="font-size:28px; font-weight:800; color:var(--cian);"><?= $activecount ?></div>
        <div class="muted">Con clave activa</div>
    </div>
</div>

<?php if ($newkey) { ?>
    <div class="card" style="border-color: rgba(25,247,241,0.35);">
        <?php render_notice('Colegio "' . htmlspecialchars($newkey['name']) . '" creado.'); ?>
        <p>Esta es su clave de API. <strong>Cópiala ahora</strong>: no se volverá a mostrar completa.</p>
        <p><code style="word-break:break-all; background:var(--azul-oscuro2); border:1px solid rgba(217,251,255,0.12); padding:12px 14px; border-radius:9px; display:block; font-size:13px; color:var(--cian-claro);"><?= htmlspecialchars($newkey['apikey']) ?></code></p>
        <p class="help">Pégala en Moodle: Administración del sitio &rarr; Complementos &rarr; Módulos de actividad &rarr; Juego Awakelab &rarr; Clave de API del Marketplace.</p>
    </div>
<?php } ?>

<div class="card">
    <h2>&#10133; Nuevo colegio</h2>
    <?php if ($error) { render_notice($error, 'error'); } ?>
    <form method="post" style="display:flex; gap:14px; align-items:flex-end;">
        <input type="hidden" name="action" value="create">
        <div style="flex:1;">
            <label for="name">Nombre del colegio</label>
            <input type="text" id="name" name="name" placeholder="p. ej. IES Awakelab" required>
        </div>
        <button type="submit">Generar clave</button>
    </form>
</div>

<div class="card">
    <h2>&#127979; Colegios existentes</h2>
    <?php if (empty($schools)) { ?>
        <div class="empty-state">
            <div class="icon">&#127979;</div>
            <p>Todavía no hay ningún colegio. Crea el primero arriba.</p>
        </div>
    <?php } else { ?>
        <table>
            <thead><tr><th>Nombre</th><th>Estado</th><th>Creado</th><th></th></tr></thead>
            <tbody>
            <?php foreach ($schools as $school) { ?>
                <tr>
                    <td><?= htmlspecialchars($school['name']) ?></td>
                    <td><?= $school['active'] ? '<span class="pill">&#10003; Activo</span>' : '<span class="pill pill-muted">Revocado</span>' ?></td>
                    <td class="muted"><?= date('d/m/Y', (int) $school['created_at']) ?></td>
                    <td>
                        <form method="post" style="margin:0;">
                            <input type="hidden" name="action" value="toggle">
                            <input type="hidden" name="school_id" value="<?= (int) $school['id'] ?>">
                            <input type="hidden" name="active" value="<?= $school['active'] ? '0' : '1' ?>">
                            <button type="submit" class="btn-secondary btn-sm"><?= $school['active'] ? 'Revocar' : 'Reactivar' ?></button>
                        </form>
                    </td>
                </tr>
            <?php } ?>
            </tbody>
        </table>
    <?php } ?>
</div>

<div class="hero" style="margin-top:40px;">
    <div class="eyebrow">Solo para admins</div>
    <h1 style="font-size:22px;">Administradores del Marketplace</h1>
    <p class="lead">Cuentas con acceso a este panel. Solo alguien ya logueado como admin puede crear o revocar otras cuentas de administrador.</p>
</div>

<?php if ($adminok) { render_notice('Administrador creado correctamente.'); } ?>

<div class="card">
    <h2>&#10133; Nuevo administrador</h2>
    <?php if ($adminerror) { render_notice($adminerror, 'error'); } ?>
    <form method="post" style="display:flex; gap:14px; align-items:flex-end; flex-wrap:wrap;">
        <input type="hidden" name="action" value="create_admin">
        <div style="flex:1; min-width:220px;">
            <label for="admin_username">Usuario</label>
            <input type="text" id="admin_username" name="admin_username" required>
        </div>
        <div style="flex:1; min-width:220px;">
            <label for="admin_password">Contraseña (mínimo 8 caracteres)</label>
            <input type="password" id="admin_password" name="admin_password" minlength="8" required>
        </div>
        <button type="submit">Crear administrador</button>
    </form>
</div>

<div class="card">
    <h2>&#128100; Administradores existentes</h2>
    <table>
        <thead><tr><th>Usuario</th><th>Estado</th><th>Creado</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($admins as $a) {
            $isself = (int) $a['id'] === (int) $admin['id'];
        ?>
            <tr>
                <td><?= htmlspecialchars($a['username']) ?><?= $isself ? ' <span class="pill pill-muted">Tú</span>' : '' ?></td>
                <td><?= $a['active'] ? '<span class="pill">&#10003; Activo</span>' : '<span class="pill pill-muted">Revocado</span>' ?></td>
                <td class="muted"><?= date('d/m/Y', (int) $a['created_at']) ?></td>
                <td>
                    <?php if (!$isself) { ?>
                        <form method="post" style="margin:0;">
                            <input type="hidden" name="action" value="toggle_admin">
                            <input type="hidden" name="admin_id" value="<?= (int) $a['id'] ?>">
                            <input type="hidden" name="active" value="<?= $a['active'] ? '0' : '1' ?>">
                            <button type="submit" class="btn-secondary btn-sm"><?= $a['active'] ? 'Revocar' : 'Reactivar' ?></button>
                        </form>
                    <?php } ?>
                </td>
            </tr>
        <?php } ?>
        </tbody>
    </table>
</div>
<?php
render_footer();
