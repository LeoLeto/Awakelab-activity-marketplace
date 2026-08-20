<?php
require_once __DIR__ . '/../src/auth.php';
require_once __DIR__ . '/../src/games.php';
require_once __DIR__ . '/../src/layout.php';

require_login();

$id = (int) ($_GET['id'] ?? 0);
$game = $id ? get_game($id) : null;

if (!$game) {
    render_header('Juego no encontrado');
    echo '<h1>No encontrado</h1>';
    render_notice('Ese juego no existe o ha sido retirado.', 'error');
    echo '<p><a href="catalog.php">&larr; Volver al catálogo</a></p>';
    render_footer();
    exit;
}

render_header($game['title'], '&larr; Catálogo', 'catalog.php');
?>
<div class="hero">
    <div class="eyebrow">Ficha del juego</div>
    <h1><?= htmlspecialchars($game['title']) ?></h1>
    <div class="meta" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">
        <span class="pill pill-muted">&#127979; <?= htmlspecialchars($game['school_name']) ?></span>
        <?php if ($game['subject']) { ?><span class="pill"><?= htmlspecialchars($game['subject']) ?></span><?php } ?>
        <span class="pill pill-muted">Actualizado el <?= date('d/m/Y', (int) $game['updated_at']) ?></span>
    </div>
</div>

<?php if (trim((string) $game['prompt']) !== '') { ?>
<div class="card">
    <h2>&#128221; Descripción original</h2>
    <p class="muted" style="color:var(--texto-suave); font-size:14px;"><?= nl2br(htmlspecialchars($game['prompt'])) ?></p>
</div>
<?php } ?>

<div class="card" style="padding:0; overflow:hidden;">
    <div style="padding:14px 18px; border-bottom:1px solid var(--borde); display:flex; align-items:center; gap:8px;">
        <span style="width:10px;height:10px;border-radius:50%;background:#ff6b6b;display:inline-block;"></span>
        <span style="width:10px;height:10px;border-radius:50%;background:#ffd166;display:inline-block;"></span>
        <span style="width:10px;height:10px;border-radius:50%;background:#19F7F1;display:inline-block;"></span>
        <span class="muted" style="margin-left:6px;">Vista previa</span>
    </div>
    <iframe
        srcdoc="<?= htmlspecialchars($game['html']) ?>"
        sandbox="allow-scripts allow-same-origin"
        style="width:100%; min-height:600px; border:0; background:#fff; display:block;"
        title="<?= htmlspecialchars($game['title']) ?>"
    ></iframe>
</div>

<p class="muted">Para usar este juego en tu curso, ve a Moodle, crea una actividad "Juego Awakelab" y elige "Usar del Marketplace".</p>
<?php
render_footer();
