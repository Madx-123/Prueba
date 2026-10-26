<?php
session_start();
header('Content-Type: application/json');

// Ajusta estas credenciales si tu XAMPP tiene una configuración distinta

$host = '127.0.0.1';
$db   = 'contentai_pyme';
$user = 'contentai_app';
$pass = 'ADMIN123';


try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Capturar datos del formulario
    $nombre = $_POST['nombre'] ?? '';
    $correo = $_POST['correo'] ?? '';
    $password = $_POST['password'] ?? '';

    // 2. Validar que no lleguen vacíos
    if (empty($nombre) || empty($correo) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios.']);
        exit;
    }

    // 3. Encriptar la contraseña (Hash adaptativo)
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 4. Insertar en la base de datos
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$nombre, $correo, $password_hash]);

$id_usuario = (int) $pdo->lastInsertId();

session_regenerate_id(true);

$_SESSION['id_usuario'] = $id_usuario;
$_SESSION['nombre'] = $nombre;
$_SESSION['correo'] = $correo;

echo json_encode([
    'status' => 'success',
    'message' => 'Cuenta creada correctamente.',
    'user' => [
        'id' => 'mysql-' . $id_usuario,
        'name' => $nombre,
        'email' => $correo
    ]
]);

} catch (PDOException $e) {
    // Código 23000 es el error de duplicado en MySQL (correo ya existe)
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'Este correo ya está registrado.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}
?>