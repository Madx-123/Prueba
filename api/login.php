<?php
header('Content-Type: application/json');
session_start();

$host = '127.0.0.1';
$db   = 'contentai_pyme';
$user = 'root';
$pass = 'uriel'; // <- Pon la misma clave que usaste en registro.php

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $correo = $_POST['correo'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($correo) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Ingresa tu correo y contraseña.']);
        exit;
    }

    // Buscamos si el correo existe en la base de datos
    $stmt = $pdo->prepare("SELECT id_usuario, nombre, password_hash FROM usuarios WHERE correo = ?");
    $stmt->execute([$correo]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // password_verify hace la magia de comparar la clave que escribes con el hash encriptado de MySQL
    if ($usuario && password_verify($password, $usuario['password_hash'])) {
        
        $_SESSION['id_usuario'] = $usuario['id_usuario'];
        $_SESSION['nombre'] = $usuario['nombre'];

        echo json_encode([
            'status' => 'success', 
            'message' => 'Inicio de sesión exitoso.',
            'nombre' => $usuario['nombre']
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Correo o contraseña incorrectos.']);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error de conexión: ' . $e->getMessage()]);
}
?>