<?php
session_start();
require_once __DIR__ . '/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['id_usuario'])) {
        responder([
            'status' => 'success',
            'user' => [
                'id' => 'mysql-' . $_SESSION['id_usuario'],
                'name' => $_SESSION['nombre'],
                'email' => $_SESSION['correo'] ?? ''
            ]
        ]);
    }
    responder(['status' => 'none', 'user' => null]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['status' => 'error', 'message' => 'Método no permitido.'], 405);
}

if (($_POST['accion'] ?? '') === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    responder(['status' => 'success', 'message' => 'Sesión cerrada.']);
}

$correo = strtolower(trim((string)($_POST['correo'] ?? '')));
$password = (string)($_POST['password'] ?? '');
if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || $password === '') {
    responder(['status' => 'error', 'message' => 'Ingresa un correo y una contraseña válidos.'], 422);
}

try {
    $pdo = conectarBD();
    $stmt = $pdo->prepare('SELECT id_usuario, nombre, correo, password_hash FROM usuarios WHERE correo = ? LIMIT 1');
    $stmt->execute([$correo]);
    $usuario = $stmt->fetch();

    if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
        responder(['status' => 'error', 'message' => 'Correo o contraseña incorrectos.'], 401);
    }

    session_regenerate_id(true);
    $_SESSION['id_usuario'] = (int)$usuario['id_usuario'];
    $_SESSION['nombre'] = $usuario['nombre'];
    $_SESSION['correo'] = $usuario['correo'];
    responder([
        'status' => 'success',
        'message' => 'Inicio de sesión correcto.',
        'user' => [
            'id' => 'mysql-' . $usuario['id_usuario'],
            'name' => $usuario['nombre'],
            'email' => $usuario['correo']
        ]
    ]);
} catch (Throwable $e) {
    error_log('ContentAI login: ' . $e->getMessage());
    responder(['status' => 'error', 'message' => 'No se pudo iniciar sesión. Verifica MySQL y la tabla usuarios.'], 500);
}
