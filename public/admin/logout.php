<?php
require_once __DIR__ . '/../../src/admin_auth.php';

logout_admin();
header('Location: login.php');
exit;
