<?php
require_once __DIR__ . '/../config/database.php';

class AuthController {
    
    public function login() {
        $correo = strtolower(trim($_POST['correo'] ?? ''));
        $password = $_POST['password'] ?? '';

        if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || empty($password)) {
            $this->responderError('Ingresa un correo y una contraseña válidos.', 422);
        }

        $pdo = Database::conectar();
        $stmt = $pdo->prepare('SELECT id_usuario, nombre, correo, password_hash FROM usuarios WHERE correo = ? LIMIT 1');
        $stmt->execute([$correo]);
        $usuario = $stmt->fetch();

        if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
            $this->responderError('Correo o contraseña incorrectos.', 401);
        }

        session_regenerate_id(true);
        $_SESSION['id_usuario'] = (int)$usuario['id_usuario'];
        $_SESSION['nombre'] = $usuario['nombre'];
        $_SESSION['correo'] = $usuario['correo'];

        echo json_encode([
            'status' => 'success',
            'user' => [
                'id' => 'mysql-' . $usuario['id_usuario'],
                'name' => $usuario['nombre'],
                'email' => $usuario['correo']
            ]
        ]);
    }
    public function registro(): void {
        $nombre = trim($_POST['nombre'] ?? '');
        $correo = strtolower(trim($_POST['correo'] ?? ''));
        $password = $_POST['password'] ?? '';

        // Validaciones básicas
        if (strlen($nombre) < 2) {
            $this->responderError('El nombre es demasiado corto.', 422);
        }
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $this->responderError('Ingresa un correo válido.', 422);
        }
        if (strlen($password) < 6) {
            $this->responderError('La contraseña debe tener al menos 6 caracteres.', 422);
        }

        try {
            $pdo = Database::conectar();
            
            $password_hash = password_hash($password, PASSWORD_DEFAULT);

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
            if ($e->getCode() == 23000) {
                $this->responderError('Este correo ya está registrado.', 409);
            } else {
                $this->responderError('No se pudo registrar la cuenta. Verifica la base de datos.', 500);
            }
        }
    }

    public function checkSession() {
        if (isset($_SESSION['id_usuario'])) {
            echo json_encode([
                'status' => 'success',
                'user' => [
                    'id' => 'mysql-' . $_SESSION['id_usuario'],
                    'name' => $_SESSION['nombre'],
                    'email' => $_SESSION['correo'] ?? ''
                ]
            ]);
        } else {
            echo json_encode(['status' => 'none', 'user' => null]);
        }
    }

    public function logout(): void {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        echo json_encode(['status' => 'success', 'message' => 'Sesión cerrada correctamente.']);
    }
 
    private function responderError(string $mensaje, int $codigo): void {
        http_response_code($codigo);
        echo json_encode(['status' => 'error', 'message' => $mensaje]);
        exit;
    }

}