<?php
require_once __DIR__ . '/../../src/admin_auth.php';
require_once __DIR__ . '/../../src/auth.php';
require_once __DIR__ . '/../../src/layout.php';

require_admin();

$users = list_users();

render_header('Profesores registrados', 'Volver a colegios y claves', 'keys.php');
?>
<div class="hero">
    <div class="eyebrow">Panel de administración</div>
    <h1>Profesores registrados</h1>
    <p class="lead">Cuentas de la web del Marketplace (registradas en <code>register.php</code>) que pueden explorar y reutilizar el catálogo. Solo lectura por ahora.</p>
</div>

<div class="card" style="margin-bottom:0;">
    <div style="margin-bottom:14px;">
        <span class="pill"><?= count($users) ?> registrados</span>
    </div>
    <?php if (empty($users)) { ?>
        <div class="empty-state">
            <div class="icon">&#128101;</div>
            <p>Todavía no se ha registrado ningún profesor.</p>
        </div>
    <?php } else { ?>
        <table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Registrado</th></tr></thead>
            <tbody>
            <?php foreach ($users as $u) { ?>
                <tr>
                    <td><?= htmlspecialchars($u['name']) ?></td>
                    <td><?= htmlspecialchars($u['email']) ?></td>
                    <td class="muted"><?= date('d/m/Y', (int) $u['created_at']) ?></td>
                </tr>
            <?php } ?>
            </tbody>
        </table>
    <?php } ?>
</div>
<?php
render_footer();
