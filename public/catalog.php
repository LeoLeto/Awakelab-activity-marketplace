<?php
require_once __DIR__ . '/../src/auth.php';
require_once __DIR__ . '/../src/games.php';
require_once __DIR__ . '/../src/layout.php';

$user = require_login();
$search = trim($_GET['q'] ?? '');
$sort = $_GET['sort'] ?? 'popular';
if (!in_array($sort, ['popular', 'rating', 'used', 'published'], true)) {
    $sort = 'popular';
}
$games = list_games($search, $sort);

render_header('Catálogo', 'Salir (' . $user['name'] . ')', 'logout.php');
?>
<div class="hero">
    <div class="eyebrow">Marketplace de Awakelab</div>
    <h1>Catálogo de juegos educativos</h1>
    <p class="lead">Explora los juegos creados por profesores de otros colegios y reutilízalos directamente en tus cursos de Moodle, sin generar contenido duplicado.</p>
</div>

<form method="get" class="card" style="display:flex; gap:14px; align-items:flex-end; flex-wrap:wrap;">
    <div style="flex:1; min-width:220px;">
        <label for="q">Buscar por título o tema</label>
        <input type="search" id="q" name="q" value="<?= htmlspecialchars($search) ?>" placeholder="p. ej. volcanes, fracciones, revolución francesa...">
    </div>
    <div>
        <label for="sort">Ordenar por</label>
        <select id="sort" name="sort">
            <option value="popular" <?= $sort === 'popular' ? 'selected' : '' ?>>Populares (valorados + usados)</option>
            <option value="rating" <?= $sort === 'rating' ? 'selected' : '' ?>>Mejor valorados</option>
            <option value="used" <?= $sort === 'used' ? 'selected' : '' ?>>Más usados</option>
            <option value="published" <?= $sort === 'published' ? 'selected' : '' ?>>Últimos publicados</option>
        </select>
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
        <?php foreach ($games as $game) { render_game_card($game); } ?>
    </div>
<?php } ?>
<?php
render_footer();
