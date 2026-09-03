<?php
/**
 * Cabecera/pie compartidos de la web del Marketplace, con la identidad de
 * marca de Awakelab (tipografía Poppins, paleta de azules/cianes, logotipo).
 */

function render_header(string $title, ?string $navlabel = null, ?string $navlink = null, string $variant = 'app'): void {
    ?><!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= htmlspecialchars($title) ?> · Awakelab Marketplace</title>
<link rel="icon" href="https://media.awakelab.world/MARCA_AWK26/awakelab_isotipo_fondo-blanco_transparente.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root {
    --cian-claro: #D9FBFF;
    --cian: #19F7F1;
    --cian-fuerte: #0FCED3;
    --cian-oscuro: #0B93AA;
    --azul-claro: #F0F3FC;
    --azul-claro2: #E2E6F2;
    --azul-medio: #4E7EA5;
    --azul-medio2: #34547A;
    --azul-oscuro: #01264C;
    --azul-oscuro2: #011932;
    --azul-oscuro3: #012142;
    --bg: #F7F9FD;
    --superficie: #FFFFFF;
    --superficie-suave: var(--azul-claro);
    --borde: #DEE4F0;
    --texto: var(--azul-oscuro2);
    --texto-suave: var(--azul-medio2);
    --sombra: 0 10px 28px rgba(52, 84, 122, 0.14);
    --sombra-suave: 0 2px 10px rgba(52, 84, 122, 0.08);
    --radio: 14px;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: var(--bg);
    color: var(--texto);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
}
a { color: var(--cian-oscuro); text-decoration: none; transition: color .15s ease; }
a:hover { color: var(--azul-oscuro); }

/* ---------- Cabecera de la app ---------- */
header.site {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 32px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--borde);
}
header.site .brand { display: flex; align-items: center; gap: 10px; }
header.site img.logo { height: 28px; display: block; }
header.site nav { display: flex; align-items: center; gap: 22px; }
header.site nav a {
    font-weight: 500;
    font-size: 14px;
    color: var(--texto-suave);
    display: flex; align-items: center; gap: 6px;
}
header.site nav a:hover { color: var(--cian-oscuro); text-decoration: none; }

main { max-width: 1080px; margin: 0 auto; padding: 40px 24px 72px; }
main.narrow { max-width: 480px; }

h1, h2, h3 { font-weight: 700; letter-spacing: -0.01em; margin: 0 0 6px; color: var(--azul-oscuro2); }
h1 { font-size: 30px; }
h2 { font-size: 19px; }
p { line-height: 1.55; }

/* ---------- Hero de sección ---------- */
.hero { margin-bottom: 32px; }
.hero .eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--cian-oscuro);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 10px;
}
.hero .eyebrow::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--cian-fuerte); }
.hero p.lead { color: var(--texto-suave); max-width: 640px; font-size: 15px; }

/* ---------- Tarjetas ---------- */
.card {
    background: var(--superficie);
    border: 1px solid var(--borde);
    border-radius: var(--radio);
    padding: 26px;
    margin-bottom: 22px;
    box-shadow: var(--sombra-suave);
}
.card h2 { display: flex; align-items: center; gap: 10px; }

/* ---------- Formularios ---------- */
label { display: block; margin: 16px 0 6px; font-weight: 500; font-size: 13.5px; color: var(--texto-suave); }
label:first-child { margin-top: 0; }
input[type=text], input[type=email], input[type=password], input[type=search], textarea, select {
    width: 100%;
    padding: 11px 14px;
    border-radius: 9px;
    border: 1px solid var(--borde);
    background: var(--superficie-suave);
    color: var(--texto);
    font-family: inherit;
    font-size: 14.5px;
    transition: border-color .15s ease, box-shadow .15s ease;
}
input::placeholder, textarea::placeholder { color: #9AA9C4; }
input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--cian-fuerte);
    background: var(--superficie);
    box-shadow: 0 0 0 3px rgba(15, 206, 211, 0.18);
}
select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230B93AA' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; padding-right: 38px; }
.help { font-size: 12.5px; color: var(--texto-suave); margin-top: 6px; }

/* ---------- Botones ---------- */
button, .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, var(--cian) 0%, var(--cian-fuerte) 100%);
    color: var(--azul-oscuro2);
    border: none;
    padding: 11px 22px;
    border-radius: 9px;
    font-family: inherit;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease;
    box-shadow: 0 4px 14px rgba(15, 206, 211, 0.32);
}
button:hover, .btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(15, 206, 211, 0.45); color: var(--azul-oscuro2); text-decoration: none; }
button:active, .btn:active { transform: translateY(0); }
.btn-secondary {
    background: var(--superficie); color: var(--cian-oscuro); border: 1px solid var(--borde);
    box-shadow: none;
}
.btn-secondary:hover { background: var(--cian-claro); color: var(--azul-oscuro); box-shadow: none; border-color: var(--cian-fuerte); }
.btn-block { width: 100%; }
.btn-sm { padding: 7px 14px; font-size: 13px; }

/* ---------- Avisos ---------- */
.notice { padding: 13px 16px; border-radius: 10px; margin-bottom: 18px; font-size: 14px; display: flex; gap: 10px; align-items: flex-start; }
.notice-error { background: #FFF0F0; border: 1px solid #FFC9C9; color: #B3261E; }
.notice-success { background: var(--cian-claro); border: 1px solid #A6EEF0; color: var(--azul-oscuro); }

/* ---------- Tablas ---------- */
table { width: 100%; border-collapse: collapse; font-size: 14.5px; }
th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid var(--borde); }
th { color: var(--texto-suave); font-size: 12px; text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }
tbody tr { transition: background .12s ease; }
tbody tr:hover { background: var(--superficie-suave); }

/* ---------- Insignias ---------- */
.pill {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--cian-claro);
    color: var(--azul-oscuro);
    border-radius: 999px;
    padding: 3px 12px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}
.pill-muted { background: var(--azul-claro2); color: var(--texto-suave); }
.muted { color: var(--texto-suave); font-size: 13px; }

/* ---------- Cuadrícula de juegos ---------- */
.game-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
}
.game-card {
    background: var(--superficie);
    border: 1px solid var(--borde);
    border-radius: var(--radio);
    overflow: hidden;
    box-shadow: var(--sombra-suave);
    transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
    display: flex;
    flex-direction: column;
    color: var(--texto);
    text-decoration: none;
}
.game-card:hover { transform: translateY(-3px); box-shadow: var(--sombra); border-color: var(--cian-fuerte); color: var(--texto); text-decoration: none; }
.game-card .thumb {
    height: 96px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--cian) 0%, var(--cian-oscuro) 100%);
}
.game-card .thumb svg { width: 36px; height: 36px; opacity: .9; }
.game-card .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.game-card .body { padding: 16px 18px 18px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
.game-card h3 { font-size: 15.5px; margin: 0; line-height: 1.35; color: var(--azul-oscuro2); }
.game-card .meta { display: flex; flex-wrap: wrap; gap: 6px; }
.game-card .spacer { flex: 1; }
.game-card .foot { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }

/* ---------- Estado vacío ---------- */
.empty-state { text-align: center; padding: 56px 24px; color: var(--texto-suave); }
.empty-state .icon { font-size: 40px; margin-bottom: 12px; opacity: .6; }
.empty-state p { max-width: 360px; margin: 0 auto; }

/* ---------- Pantallas de acceso (login/registro) ---------- */
body.auth-body { display: flex; align-items: center; justify-content: center; padding: 24px; background: linear-gradient(180deg, var(--azul-claro) 0%, var(--bg) 320px); }
.auth-shell { width: 100%; max-width: 400px; }
.auth-shell .brand-center { display: flex; justify-content: center; margin-bottom: 26px; }
.auth-shell .brand-center img { height: 32px; }
.auth-shell .card { box-shadow: var(--sombra); }
.auth-shell h1 { font-size: 22px; text-align: center; }
.auth-shell p.sub { text-align: center; color: var(--texto-suave); font-size: 13.5px; margin: 0 0 20px; }
.auth-shell .switch { text-align: center; margin-top: 18px; font-size: 13.5px; color: var(--texto-suave); }

/* ---------- Pie de página ---------- */
footer.site-footer {
    border-top: 1px solid var(--borde);
    padding: 22px 24px;
    text-align: center;
    color: var(--texto-suave);
    font-size: 12.5px;
}

/* ---------- Responsive ---------- */
@media (max-width: 640px) {
    header.site { padding: 12px 18px; }
    main { padding: 28px 16px 56px; }
    .hero h1 { font-size: 24px; }
}
</style>
</head>
<?php if ($variant === 'auth') { ?>
<body class="auth-body">
<div class="auth-shell">
    <div class="brand-center">
        <img src="https://media.awakelab.world/MARCA_AWK26/awakelab_logo_fondo-blanco_transparente.png" alt="Awakelab">
    </div>
<?php } else { ?>
<body>
<header class="site">
    <a href="index.php" class="brand">
        <img class="logo" src="https://media.awakelab.world/MARCA_AWK26/awakelab_logo_fondo-blanco_transparente.png" alt="Awakelab">
    </a>
    <nav>
        <?php if ($navlabel && $navlink) { ?>
            <a href="<?= htmlspecialchars($navlink) ?>"><?= htmlspecialchars($navlabel) ?></a>
        <?php } ?>
    </nav>
</header>
<?php } ?>
<main<?= $variant === 'auth' ? ' class="narrow"' : '' ?>>
<?php
    $GLOBALS['__mp_layout_variant'] = $variant;
}

function render_footer(): void {
    $isauth = ($GLOBALS['__mp_layout_variant'] ?? 'app') === 'auth';
    ?>
</main>
<?php if ($isauth) { echo '</div>'; } ?>
<footer class="site-footer">Awakelab Marketplace &middot; Catálogo de juegos educativos</footer>
</body>
</html>
<?php
}

function render_notice(string $message, string $type = 'success'): void {
    $class = $type === 'error' ? 'notice-error' : 'notice-success';
    $icon = $type === 'error' ? '&#9888;' : '&#10003;';
    echo '<div class="notice ' . $class . '"><span>' . $icon . '</span><span>' . htmlspecialchars($message) . '</span></div>';
}

/**
 * Tarjeta de un juego para el catálogo (usada tanto en la cuadrícula
 * principal como en las filas de destacados de la portada).
 */
function render_game_card(array $game): void {
    $thumbfile = __DIR__ . '/../public/thumbs/' . (int) $game['id'] . '.png';
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
    <?php
}
