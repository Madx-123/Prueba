<?php
// Ruta de compatibilidad; usa JSON y el token CSRF del servicio.
$_GET['action'] = 'saveCompany';
require __DIR__ . '/index.php';
