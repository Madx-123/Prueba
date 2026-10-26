<?php
// ContentAI PYMES: consultar, crear o actualizar la empresa del usuario.
session_start();
require_once __DIR__ . '/conexion.php';

if (!isset($_SESSION['id_usuario'])) {
    responder([
        'status' => 'error',
        'message' => 'La sesión expiró. Inicia sesión nuevamente.'
    ], 401);
}

$idUsuario = (int) $_SESSION['id_usuario'];

function empresaParaFrontend(array $fila, int $idUsuario): array
{
    $extra = json_decode((string) ($fila['descripcion'] ?? '{}'), true);
    if (!is_array($extra)) $extra = [];

    $canales = $extra['canales'] ?? [];
    if (is_string($canales)) $canales = explode(',', $canales);
    if (!is_array($canales)) $canales = [];
    $canales = array_values(array_filter(array_map('trim', $canales)));

    return [
        'id' => 'company-mysql-' . $idUsuario,
        'userId' => 'mysql-' . $idUsuario,
        'name' => $fila['nombre_comercial'],
        'sector' => $fila['actividad_economica'],
        'city' => $fila['ubicacion'] ?? '',
        'offer' => $extra['productos'] ?? '',
        'audience' => $extra['clientes'] ?? '',
        'differentiator' => $extra['diferencia'] ?? '',
        'tone' => $extra['tono'] ?? '',
        'goal' => $extra['objetivo'] ?? '',
        'channels' => $canales
    ];
}

try {
    // Usa la misma conexión que registro.php y login.php.
    $pdo = conectarBD();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->prepare(
            'SELECT nombre_comercial, actividad_economica, descripcion, ubicacion
             FROM empresas WHERE id_usuario = ? LIMIT 1'
        );
        $stmt->execute([$idUsuario]);
        $fila = $stmt->fetch(PDO::FETCH_ASSOC);

        responder([
            'status' => 'success',
            'company' => $fila ? empresaParaFrontend($fila, $idUsuario) : null
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(['status' => 'error', 'message' => 'Método no permitido.'], 405);
    }

    $nombre = trim((string) ($_POST['nombre_comercial'] ?? ''));
    $sector = trim((string) ($_POST['sector'] ?? ''));
    $ciudad = trim((string) ($_POST['ciudad'] ?? ''));
    $productos = trim((string) ($_POST['productos'] ?? ''));
    $clientes = trim((string) ($_POST['clientes'] ?? ''));
    $tono = trim((string) ($_POST['tono'] ?? ''));
    $canales = array_values(array_filter(array_map(
        'trim', explode(',', (string) ($_POST['canales'] ?? ''))
    )));

    if ($nombre === '' || $sector === '' || $productos === '' ||
        $clientes === '' || $tono === '' || count($canales) === 0) {
        responder([
            'status' => 'error',
            'message' => 'Completa los campos obligatorios y selecciona un canal.'
        ], 422);
    }

    $extras = [
        'productos' => $productos,
        'clientes' => $clientes,
        'diferencia' => trim((string) ($_POST['diferencia'] ?? '')),
        'tono' => $tono,
        'objetivo' => trim((string) ($_POST['objetivo'] ?? '')),
        'canales' => $canales
    ];
    $descripcion = json_encode(
        $extras, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );

    // id_usuario es UNIQUE: el primer guardado inserta y los siguientes actualizan.
    // Una sola sentencia evita el error 1062 incluso ante solicitudes simultáneas.
    $sql = 'INSERT INTO empresas
                (id_usuario, nombre_comercial, actividad_economica, descripcion, ubicacion)
            VALUES
                (:id, :nombre, :sector, :descripcion, :ciudad)
            ON DUPLICATE KEY UPDATE
                nombre_comercial = :nombre2,
                actividad_economica = :sector2,
                descripcion = :descripcion2,
                ubicacion = :ciudad2';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'id' => $idUsuario,
        'nombre' => $nombre,
        'sector' => $sector,
        'descripcion' => $descripcion,
        'ciudad' => $ciudad,
        'nombre2' => $nombre,
        'sector2' => $sector,
        'descripcion2' => $descripcion,
        'ciudad2' => $ciudad
    ]);

    responder([
        'status' => 'success',
        'message' => 'Empresa guardada correctamente en MySQL.',
        'company' => empresaParaFrontend([
            'nombre_comercial' => $nombre,
            'actividad_economica' => $sector,
            'descripcion' => $descripcion,
            'ubicacion' => $ciudad
        ], $idUsuario)
    ]);
} catch (Throwable $e) {
    error_log('ContentAI guardar empresa: ' . $e->getMessage());
    responder([
        'status' => 'error',
        'message' => 'No se pudo guardar la empresa. Revisa el servidor y la tabla empresas.'
    ], 500);
}
