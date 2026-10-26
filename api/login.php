<?php
// Ruta de compatibilidad; usa JSON y el token CSRF del servicio.
$_GET['action'] = 'login';
require __DIR__ . '/index.php';
