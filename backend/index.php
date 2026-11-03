<?php
// Configuración básica de cabeceras para API REST
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

// Manejar los errores de PHP para que devuelvan JSON en lugar de romper la app
set_exception_handler(function($e) {
    echo json_encode([
        'status' => 'error', 
        'message' => 'Error interno del servidor: ' . $e->getMessage()
    ]);
});

// Cargar el archivo de rutas
require_once __DIR__ . '/routes/api.php';