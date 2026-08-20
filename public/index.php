<?php
require_once __DIR__ . '/../src/auth.php';

header('Location: ' . (current_user() ? 'catalog.php' : 'login.php'));
exit;
