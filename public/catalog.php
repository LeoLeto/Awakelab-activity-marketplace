<?php
require_once __DIR__ . '/../src/auth.php';
require_once __DIR__ . '/../src/games.php';
require_once __DIR__ . '/../src/layout.php';

$user = require_login();
$search = trim($_GET['q'] ?? '');
$games = list_games($search);

render_header('Catálogo', 'Salir (' . $user['name'] . ')', 'logout.php');
?>
<div class="hero">
    <div class="eyebrow">Marketplace de Awakelab</div>
    <h1>Catálogo de juegos educativos</h1>
    <p class="lead">Explora los juegos creados por profesores de otros colegios y reutilízalos directamente en tus cursos de Moodle, sin generar contenido duplicado.</p>
</div>

<form method="get" class="card" style="display:flex; gap:14px; align-items:flex-end;">
    <div style="flex:1;">
        <label for="q">Buscar por título o tema</label>
        <input type="search" id="q" name="q" value="<?= htmlspecialchars($search) ?>" placeholder="p. ej. volcanes, fracciones, revolución francesa...">
    </div>
    <button type="submit">Buscar</button>
</form>

<?php if (empty($games)) { ?>
    <div class="card empty-state">
        <div class="icon">&#128218;</div>
        <h2 style="justify-content:center;">Sin resultados</h2>
        <p><?= $search !== ''
            ? 'Ningún juego coincide con "' . htmlspecialchars($search) . '". Prueba con otro término.'
            : 'Todavía no hay ningún juego publicado. En cuanto un profesor comparta uno desde Moodle, aparecerá aquí.' ?></p>
    </div>
<?php } else { ?>
    <div class="game-grid">
        <?php foreach ($games as $game) {
            $thumbfile = __DIR__ . '/thumbs/' . (int) $game['id'] . '.png';
            $hasthumb = file_exists($thumbfile);
        ?>
            <a class="game-card" href="game.php?id=<?= (int) $game['id'] ?>">
                <div class="thumb">
                    <?php if ($hasthumb) { ?>
                        <img src="thumbs/<?= (int) $game['id'] ?>.png" alt="">
                    <?php } else { ?>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9.5 3.5a1.75 1.75 0 1 1 3.5 0V5h2.25A1.25 1.25 0 0 1 16.5 6.25V8.5h1.25a1.75 1.75 0 1 1 0 3.5H16.5v2.25a1.25 1.25 0 0 1-1.25 1.25H13v1.25a1.75 1.75 0 1 1-3.5 0V15.5H7.25A1.25 1.25 0 0 1 6 14.25V12H4.75a1.75 1.75 0 1 1 0-3.5H6V6.25A1.25 1.25 0 0 1 7.25 5H9.5V3.5Z"/>
                        </svg>
                    <?php } ?>
                </div>
                <div class="body">
                    <h3><?= htmlspecialchars($game['title']) ?></h3>
                    <div class="meta">
                        <?php if ($game['subject']) { ?><span class="pill"><?= htmlspecialchars($game['subject']) ?></span><?php } ?>
                        <span class="pill pill-muted"><?= htmlspecialchars($game['school_name']) ?></span>
                        <span class="pill">&#9733; <?= $game['avg_rating'] !== null ? round((float) $game['avg_rating'], 1) : '—' ?></span>
                        <span class="pill pill-muted">Usado <?= (int) ($game['times_used'] ?? 0) ?></span>
                    </div>
                    <div class="spacer"></div>
                    <div class="foot">
                        <span class="muted">Actualizado <?= date('d/m/Y', (int) $game['updated_at']) ?></span>
                        <span class="btn btn-secondary btn-sm">Ver &rarr;</span>
                    </div>
                </div>
            </a>
        <?php } ?>
    </div>
<?php } ?>
<?php
render_footer();
