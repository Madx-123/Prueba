<?php
// Una única sesión para toda la API; peticiones desde el mismo origen (Apache/XAMPP).
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'use_strict_mode' => true,
        'cookie_httponly' => true,
        'cookie_secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'cookie_samesite' => 'Lax'
    ]);
}

set_exception_handler(function (Throwable $e): void {
    error_log((string) $e);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error interno del servidor. Consulta el registro de Apache/PHP.']);
});

require_once __DIR__ . '/routes/api.php';
