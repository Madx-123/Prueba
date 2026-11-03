<?php
require_once __DIR__ . '/../config/database.php';

class EmpresaController {
    
    public function obtenerEmpresa(): void {
        $this->verificarSesion();
        $idUsuario = (int) $_SESSION['id_usuario'];

        try {
            $pdo = Database::conectar();
            $stmt = $pdo->prepare('SELECT nombre_comercial, actividad_economica, descripcion, ubicacion FROM empresas WHERE id_usuario = ? LIMIT 1');
            $stmt->execute([$idUsuario]);
            $fila = $stmt->fetch();

            if ($fila) {
                // Decodificar el JSON de la descripción
                $extra = json_decode($fila['descripcion'] ?? '{}', true) ?: [];
                $canales = isset($extra['canales']) && is_string($extra['canales']) ? explode(',', $extra['canales']) : [];

                echo json_encode([
                    'status' => 'success',
                    'company' => [
                        'name' => $fila['nombre_comercial'],
                        'sector' => $fila['actividad_economica'],
                        'city' => $fila['ubicacion'] ?? '',
                        'offer' => $extra['productos'] ?? '',
                        'audience' => $extra['clientes'] ?? '',
                        'differentiator' => $extra['diferencia'] ?? '',
                        'tone' => $extra['tono'] ?? '',
                        'channels' => $canales
                    ]
                ]);
            } else {
                echo json_encode(['status' => 'success', 'company' => null]);
            }
        } catch (Exception $e) {
            $this->responderError('Error al cargar la empresa.', 500);
        }
    }

    public function guardarEmpresa(): void {
        $this->verificarSesion();
        $idUsuario = (int) $_SESSION['id_usuario'];

        $nombre = trim($_POST['nombre'] ?? '');
        $sector = trim($_POST['sector'] ?? '');
        $ciudad = trim($_POST['ciudad'] ?? '');
        $productos = trim($_POST['productos'] ?? '');
        $clientes = trim($_POST['clientes'] ?? '');
        $tono = trim($_POST['tono'] ?? '');
        $canalesStr = trim($_POST['canales'] ?? '');
        
        if ($nombre === '' || $sector === '' || $productos === '' || $clientes === '' || $tono === '' || $canalesStr === '') {
            $this->responderError('Completa los campos obligatorios y selecciona al menos un canal.', 422);
        }

        // Empaquetar datos adicionales en JSON
        $extras = [
            'productos' => $productos,
            'clientes' => $clientes,
            'diferencia' => trim($_POST['diferencia'] ?? ''),
            'tono' => $tono,
            'canales' => $canalesStr
        ];
        $descripcion = json_encode($extras, JSON_UNESCAPED_UNICODE);

        try {
            $pdo = Database::conectar();
            $sql = 'INSERT INTO empresas (id_usuario, nombre_comercial, actividad_economica, descripcion, ubicacion)
                    VALUES (:id, :nombre, :sector, :descripcion, :ciudad)
                    ON DUPLICATE KEY UPDATE 
                    nombre_comercial = :nombre2, actividad_economica = :sector2, descripcion = :descripcion2, ubicacion = :ciudad2';
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id' => $idUsuario,
                'nombre' => $nombre, 'sector' => $sector, 'descripcion' => $descripcion, 'ciudad' => $ciudad,
                'nombre2' => $nombre, 'sector2' => $sector, 'descripcion2' => $descripcion, 'ciudad2' => $ciudad
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Empresa guardada correctamente.']);
        } catch (Exception $e) {
            $this->responderError('No se pudo guardar la empresa.', 500);
        }
    }

    private function verificarSesion(): void {
        if (!isset($_SESSION['id_usuario'])) {
            $this->responderError('Sesión expirada. Inicia sesión nuevamente.', 401);
        }
    }

    private function responderError(string $mensaje, int $codigo): void {
        http_response_code($codigo);
        echo json_encode(['status' => 'error', 'message' => $mensaje]);
        exit;
    }
}