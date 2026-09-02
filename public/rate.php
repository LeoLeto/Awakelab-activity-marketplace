<?php
require_once __DIR__ . '/../src/auth.php';
require_once __DIR__ . '/../src/games.php';

$user = require_login();

$gameid = (int) ($_POST['game_id'] ?? 0);
$stars = (int) ($_POST['stars'] ?? 0);

$result = ['ok' => false];
if ($gameid > 0) {
    $result = rate_game($gameid, (int) $user['id'], $stars);
}

header('Location: game.php?id=' . $gameid . '&rated=' . ($result['ok'] ? 'ok' : 'error'));
