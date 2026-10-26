<?php
// Configura aquí las credenciales de MySQL de tu XAMPP.
// No publiques este archivo con una contraseña real en un repositorio público.
function conectarBD(): PDO {

$host = 'localhost';
$base = 'contentai_pyme';
$usuario = 'contentai_app';
$clave = 'ADMIN123';


    return new PDO(
        "mysql:host={$host};dbname={$base};charset=utf8mb4",
        $usuario,
        $clave,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
}
function responder(array $datos, int $codigo = 200): void {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
