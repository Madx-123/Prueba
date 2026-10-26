<?php
header('Content-Type: application/json');
session_start();

// Verificamos que el usuario esté logueado
if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['status' => 'error', 'message' => 'Usuario no autorizado.']);
    exit;
}

$host = '127.0.0.1';
$db   = 'contentai_pyme';
$user = 'root';
$pass = 'uriel'; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $id_usuario = $_SESSION['id_usuario'];
    
    // Capturamos los datos principales que coinciden con tus columnas
    $nombre_comercial = $_POST['nombre_comercial'] ?? '';
    $actividad_economica = $_POST['sector'] ?? '';
    $ubicacion = $_POST['ciudad'] ?? '';
    
    // Empaquetamos todo el resto del formulario en la columna "descripcion"
    $datos_extra = [
        'productos' => $_POST['productos'] ?? '',
        'clientes' => $_POST['clientes'] ?? '',
        'diferencia' => $_POST['diferencia'] ?? '',
        'tono' => $_POST['tono'] ?? '',
        'objetivo' => $_POST['objetivo'] ?? '',
        'canales' => isset($_POST['canales']) ? $_POST['canales'] : []
    ];
    // Convertimos el arreglo extra a texto JSON para que entre en la columna descripcion
    $descripcion = json_encode($datos_extra, JSON_UNESCAPED_UNICODE);

    // Insertamos usando los nombres exactos de tu tabla
    $stmt = $pdo->prepare("INSERT INTO empresas (id_usuario, nombre_comercial, actividad_economica, descripcion, ubicacion) VALUES (?, ?, ?, ?, ?)");
    
    $stmt->execute([$id_usuario, $nombre_comercial, $actividad_economica, $descripcion, $ubicacion]);

    echo json_encode([
        'status' => 'success', 
        'message' => '¡Empresa registrada correctamente en MySQL!'
    ]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}