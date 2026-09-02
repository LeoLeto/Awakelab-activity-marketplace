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

$avgrating = $game['avg_rating'] !== null ? round((float) $game['avg_rating'], 1) : null;
$ratingcount = (int) ($game['rating_count'] ?? 0);
$timesused = (int) ($game['times_used'] ?? 0);
$rated = $_GET['rated'] ?? '';
?>
<div class="hero">
    <div class="eyebrow">Ficha del juego</div>
    <h1><?= htmlspecialchars($game['title']) ?></h1>
    <div class="meta" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">
        <span class="pill pill-muted">&#127979; <?= htmlspecialchars($game['school_name']) ?></span>
        <?php if ($game['subject']) { ?><span class="pill"><?= htmlspecialchars($game['subject']) ?></span><?php } ?>
        <span class="pill pill-muted">Actualizado el <?= date('d/m/Y', (int) $game['updated_at']) ?></span>
        <span class="pill">&#9733; <?= $avgrating !== null ? $avgrating . ' (' . $ratingcount . ')' : 'Sin valoraciones' ?></span>
        <span class="pill pill-muted">Usado <?= $timesused ?> <?= $timesused === 1 ? 'vez' : 'veces' ?></span>
    </div>
</div>

<?php if ($rated === 'ok') { render_notice('¡Gracias por tu valoración!'); } ?>
<?php if ($rated === 'error') { render_notice('No se pudo guardar la valoración.', 'error'); } ?>

<div class="card">
    <h2>&#11088; Valora este juego</h2>
    <form method="post" action="rate.php">
        <input type="hidden" name="game_id" value="<?= (int) $game['id'] ?>">
        <div class="star-rating">
            <input type="radio" id="star5" name="stars" value="5"><label for="star5">&#9733;</label>
            <input type="radio" id="star4" name="stars" value="4"><label for="star4">&#9733;</label>
            <input type="radio" id="star3" name="stars" value="3"><label for="star3">&#9733;</label>
            <input type="radio" id="star2" name="stars" value="2"><label for="star2">&#9733;</label>
            <input type="radio" id="star1" name="stars" value="1"><label for="star1">&#9733;</label>
        </div>
        <p><button type="submit" class="btn-secondary">Enviar valoración</button></p>
    </form>
</div>
<style>
.star-rating { display: inline-flex; flex-direction: row-reverse; font-size: 30px; }
.star-rating input { display: none; }
.star-rating label { color: var(--borde); cursor: pointer; padding: 0 2px; }
.star-rating input:checked ~ label,
.star-rating label:hover,
.star-rating label:hover ~ label { color: var(--cian-fuerte); }
</style>

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
